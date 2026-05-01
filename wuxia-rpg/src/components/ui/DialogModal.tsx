import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameSelector, useGameDispatch } from '../../contexts/GameContext';
import type { DialogOption, GameState } from '../../types';
import { getDialog } from '../../data/dialogs';

interface DialogModalProps {
  dialogId: string;
  characterName: string;
  onClose: () => void;
}

export default function DialogModal({ dialogId, characterName, onClose }: DialogModalProps) {
  const dispatch = useGameDispatch();
  const player = useGameSelector((state: GameState) => state.player);
  
  const dialog = getDialog(dialogId);
  
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(dialog?.startNodeId || null);
  const [dialogHistory, setDialogHistory] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const currentNode = currentNodeId ? dialog?.nodes.find(n => n.id === currentNodeId) : null;
  
  const startTyping = useCallback((text: string) => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    
    setIsTyping(true);
    setDisplayedText('');
    
    let index = 0;
    
    typingIntervalRef.current = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
        }
        setIsTyping(false);
      }
    }, 30);
  }, []);
  
  const skipTyping = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    if (currentNode) {
      setDisplayedText(currentNode.text);
    }
    setIsTyping(false);
  }, [currentNode]);
  
  useEffect(() => {
    if (currentNode) {
      startTyping(currentNode.text);
    }
    
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [currentNode, startTyping]);
  
  const checkCondition = useCallback((option: DialogOption): boolean => {
    if (!option.condition) return true;
    
    const { type, value } = option.condition;
    
    switch (type) {
      case 'has_gold':
        return player.gold >= (value as number);
      case 'min_level':
        return player.level >= (value as number);
      case 'min_attribute':
        return false;
      case 'has_item':
        return player.inventory.some(i => i.id === value);
      case 'has_technique':
        return player.knownTechniques.includes(value as string);
      default:
        return true;
    }
  }, [player]);
  
  const handleNodeChange = useCallback((nodeId: string) => {
    if (currentNodeId) {
      setDialogHistory(prev => [...prev, currentNodeId]);
    }
    setCurrentNodeId(nodeId);
  }, [currentNodeId]);
  
  const handleOptionClick = useCallback((option: DialogOption) => {
    if (isTyping) {
      skipTyping();
      return;
    }
    
    if (option.action) {
      switch (option.action) {
        case 'give_gold':
          if (typeof option.actionData === 'number') {
            dispatch({ type: 'MODIFY_GOLD', payload: { amount: option.actionData } });
          }
          break;
        case 'give_item':
          break;
        case 'learn_technique':
          if (typeof option.actionData === 'string') {
            dispatch({ type: 'LEARN_TECHNIQUE', payload: { techniqueId: option.actionData } });
          }
          break;
        case 'trigger_event':
          break;
      }
    }
    
    if (option.nextNodeId) {
      handleNodeChange(option.nextNodeId);
    } else if (option.isEnd) {
      onClose();
    }
  }, [dispatch, handleNodeChange, isTyping, onClose, skipTyping]);
  
  const handleBack = useCallback(() => {
    if (dialogHistory.length > 0) {
      const prevNodeId = dialogHistory[dialogHistory.length - 1];
      setDialogHistory(prev => prev.slice(0, -1));
      setCurrentNodeId(prevNodeId);
    }
  }, [dialogHistory]);
  
  if (!dialog || !currentNode) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(26, 26, 26, 0.8)' }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-md p-6 rounded-lg shadow-2xl border-2"
          style={{ backgroundColor: '#e8e0d0', borderColor: '#dc2626' }}
        >
          <p className="text-center" style={{ color: '#dc2626' }}>对话不存在或已结束</p>
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 rounded-lg"
            style={{ backgroundColor: '#1a1a1a', color: '#f5f0e6' }}
          >
            关闭
          </button>
        </div>
      </div>
    );
  }
  
  const availableOptions = currentNode.options?.filter(checkCondition) || [];
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(26, 26, 26, 0.7)' }}
    >
      <div
        className="w-full max-w-2xl flex flex-col rounded-t-lg shadow-2xl border-2 border-b-0"
        style={{
          backgroundColor: '#e8e0d0',
          borderColor: 'rgba(122, 122, 122, 0.3)',
          maxHeight: '60vh',
        }}
      >
        <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧙</span>
            <span className="font-serif font-bold" style={{ color: '#c9a227' }}>
              {currentNode.speaker || characterName}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center transition-colors"
            style={{ color: '#7a7a7a' }}
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div 
            className="p-4 rounded-lg mb-4 cursor-pointer"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
            onClick={isTyping ? skipTyping : undefined}
          >
            <p style={{ color: '#1a1a1a', lineHeight: 1.8 }}>
              {displayedText || currentNode.text}
              {isTyping && <span className="animate-pulse">▋</span>}
            </p>
            {isTyping && (
              <p className="text-xs mt-2" style={{ color: '#7a7a7a' }}>
                点击跳过
              </p>
            )}
          </div>
          
          {!isTyping && availableOptions.length > 0 && (
            <div className="space-y-2">
              {availableOptions.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  className="w-full px-4 py-3 rounded-lg text-left transition-all hover:scale-102"
                  style={{
                    backgroundColor: 'rgba(201, 162, 39, 0.1)',
                    border: '1px solid rgba(201, 162, 39, 0.3)',
                    color: '#1a1a1a',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ color: '#c9a227', marginRight: 8 }}>▸</span>
                  {option.text}
                </button>
              ))}
            </div>
          )}
          
          {!isTyping && currentNode.isEnd && (
            <button
              onClick={onClose}
              className="w-full px-4 py-3 rounded-lg mt-4"
              style={{ backgroundColor: '#1a1a1a', color: '#f5f0e6' }}
            >
              结束对话
            </button>
          )}
        </div>
        
        {dialogHistory.length > 0 && (
          <div className="p-3 border-t" style={{ borderColor: 'rgba(122, 122, 122, 0.3)' }}>
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded text-sm"
              style={{ backgroundColor: 'rgba(122, 122, 122, 0.1)', color: '#7a7a7a' }}
            >
              ← 返回
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
