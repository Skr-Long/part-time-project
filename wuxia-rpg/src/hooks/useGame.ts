import { useContext } from 'react';
import GameContext from '../contexts/GameContext';
import { useGameSelector, useGameDispatch } from '../contexts/GameContext';
import { saveGame, loadGame, deleteGame, hasSavedGame } from './useSaveLoad';

export function useGame() {
  const ctx = useContext(GameContext)!;
  const dispatch = useGameDispatch();

  return {
    state: ctx.state,
    dispatch,
    saveGame: () => saveGame(ctx.state),
    loadGame: () => {
      const loaded = loadGame();
      if (loaded) dispatch({ type: 'LOAD_STATE', payload: loaded });
      return loaded;
    },
    deleteGame,
    hasSavedGame,
    player: ctx.state.player,
    location: ctx.state.location,
    combat: ctx.state.combat,
    ui: ctx.state.ui,
  };
}

export { useGameSelector, useGameDispatch };
