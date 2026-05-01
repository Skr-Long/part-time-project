import type { Dialog } from '../types';

export const DIALOGS: Record<string, Dialog> = {
  'monk-master-dialog': {
    id: 'monk-master-dialog',
    characterId: 'monk-master',
    startNodeId: 'greeting',
    nodes: [
      {
        id: 'greeting',
        speaker: '静心大师',
        text: '阿弥陀佛，施主远道而来，想必是有缘人。老僧在这破庙中修行多年，见过不少江湖过客。施主此番前来，所为何事？',
        options: [
          { text: '打扰大师清修，晚辈只是路过此地。', nextNodeId: 'passing' },
          { text: '晚辈听闻大师武学修为高深，想请教一二。', nextNodeId: 'learn' },
          { text: '大师，这寺庙可有什么故事？', nextNodeId: 'story' },
        ],
      },
      {
        id: 'passing',
        speaker: '静心大师',
        text: '原来如此。此地虽偏僻，却也并非完全与世隔绝。近来山下不太平，施主路上小心。若不嫌弃，可在此稍作歇息。',
        options: [
          { text: '多谢大师，晚辈告辞。', isEnd: true },
          { text: '大师刚才说山下不太平，可否详细说说？', nextNodeId: 'warning' },
        ],
      },
      {
        id: 'warning',
        speaker: '静心大师',
        text: '近来黑风寨的强盗活动猖獗，时常骚扰过往商客。老僧虽有心相助，奈何年事已高，力不从心。施主若是路经黑风岭，务必多加小心。',
        options: [
          { text: '晚辈记下了，多谢大师提醒。', isEnd: true },
          { text: '黑风寨？晚辈倒想会会这些强盗。', nextNodeId: 'challenge' },
        ],
      },
      {
        id: 'challenge',
        speaker: '静心大师',
        text: '施主勇气可嘉，但黑风寨人多势众，寨主黑风煞更是武功高强。施主若是想为民除害，还需量力而行。不过...老僧倒是有一套拳法，可传授于有缘人。',
        options: [
          { text: '请大师赐教！', nextNodeId: 'teach' },
          { text: '晚辈还是先提升实力再说。', isEnd: true },
        ],
      },
      {
        id: 'learn',
        speaker: '静心大师',
        text: '施主客气了。武学之道，贵在修身养性，而非争强好胜。施主若是真心向武，老僧可指点一二。',
        options: [
          { text: '请大师指点迷津！', nextNodeId: 'teach' },
          { text: '晚辈明白了，武学先修心。', isEnd: true },
        ],
      },
      {
        id: 'teach',
        speaker: '静心大师',
        text: '好！施主果然有慧根。老僧这就将《般若掌法》的入门心法传授于你。此掌法刚柔并济，讲究以静制动。记住，武学的最高境界是无招胜有招。',
        options: [
          { text: '多谢大师！晚辈定当铭记于心。', isEnd: true },
        ],
      },
      {
        id: 'story',
        speaker: '静心大师',
        text: '这座寺庙名叫「静心庵」，始建于百年前。据说当年有一位高僧在此悟道，圆寂前将毕生所学藏于寺庙某处。可惜历经战乱，如今已无人知晓具体位置。',
        options: [
          { text: '原来如此，多谢大师讲述。', isEnd: true },
          { text: '那藏宝之处，可有什么线索？', nextNodeId: 'clue' },
        ],
      },
      {
        id: 'clue',
        speaker: '静心大师',
        text: '老僧只听闻一句话：「佛前莲花，地下有灵。」除此之外，便一无所知了。施主若是有兴趣，可在寺中四处看看。不过切记，勿要惊扰了寺中清净。',
        options: [
          { text: '晚辈记下了，多谢大师。', isEnd: true },
        ],
      },
    ],
  },

  'shaolin-master-dialog': {
    id: 'shaolin-master-dialog',
    characterId: 'shaolin-master',
    startNodeId: 'greeting',
    nodes: [
      {
        id: 'greeting',
        speaker: '玄慈方丈',
        text: '阿弥陀佛，施主光临少林，不知有何贵干？少林寺乃武林泰斗，向来欢迎各路英雄前来切磋交流。',
        options: [
          { text: '晚辈久仰少林大名，特来参拜。', nextNodeId: 'visit' },
          { text: '晚辈想请教少林武学。', nextNodeId: 'learn' },
          { text: '晚辈想了解一下少林寺的情况。', nextNodeId: 'about' },
        ],
      },
      {
        id: 'visit',
        speaker: '玄慈方丈',
        text: '施主客气了。少林寺虽说是佛门清净之地，但也时常有江湖朋友来访。施主若是不嫌弃，可在寺中稍作歇息，品尝一下我少林的素斋。',
        options: [
          { text: '多谢方丈盛情。', nextNodeId: 'hospitality' },
          { text: '晚辈还有事在身，就不打扰了。', isEnd: true },
        ],
      },
      {
        id: 'hospitality',
        speaker: '玄慈方丈',
        text: '好说，好说。来人，带这位施主去客寮休息，准备素斋。对了，施主若是有兴趣，也可以去藏经阁看看我少林的武学典籍，当然，仅限入门心法。',
        options: [
          { text: '方丈真是太客气了，晚辈告辞。', isEnd: true },
        ],
      },
      {
        id: 'learn',
        speaker: '玄慈方丈',
        text: '哦？施主想学习少林武学？少林武学博大精深，非一朝一夕可成。施主若是真心向学，需先了解我少林的门规戒律。',
        options: [
          { text: '请方丈明示。', nextNodeId: 'rules' },
          { text: '晚辈只是想了解一下，并非要拜师。', nextNodeId: 'curious' },
        ],
      },
      {
        id: 'rules',
        speaker: '玄慈方丈',
        text: '少林弟子需遵守清规戒律，不得杀生、不得偷盗、不得邪淫、不得妄语、不得饮酒。当然，施主并非要出家，只是学习武学的话，只需记住一点：习武是为了强身健体、惩恶扬善，而非恃强凌弱。',
        options: [
          { text: '晚辈受教了。', isEnd: true },
          { text: '那晚辈可以学习少林武学吗？', nextNodeId: 'canLearn' },
        ],
      },
      {
        id: 'canLearn',
        speaker: '玄慈方丈',
        text: '施主与我少林有缘，老僧可以传授一些入门心法。《少林长拳》是我少林的基础武学，招式朴实无华，但胜在根基扎实。施主若是学好了，日后学习其他武学也能事半功倍。',
        options: [
          { text: '请方丈赐教！', isEnd: true },
          { text: '晚辈想学习更高深的武学。', nextNodeId: 'advanced' },
        ],
      },
      {
        id: 'advanced',
        speaker: '玄慈方丈',
        text: '高深武学？施主，武学之道，需循序渐进，切不可好高骛远。《易筋经》、《洗髓经》这些高深武学，非有大机缘、大毅力者不可得。施主还是先从基础学起吧。',
        options: [
          { text: '方丈教训的是，晚辈知错了。', isEnd: true },
        ],
      },
      {
        id: 'curious',
        speaker: '玄慈方丈',
        text: '原来如此。少林武学源远流长，自达摩祖师创立以来，已有千年历史。主要分为拳法、掌法、指法、棍法、内功等几大类。其中最著名的当属《易筋经》和《七十二绝技》。',
        options: [
          { text: '晚辈受教了，多谢方丈讲解。', isEnd: true },
          { text: '《七十二绝技》？听起来很厉害。', nextNodeId: 'skills' },
        ],
      },
      {
        id: 'skills',
        speaker: '玄慈方丈',
        text: '《七十二绝技》是少林历代高僧所创的绝学，每一项都威力无穷。比如「大力金刚掌」刚猛无比，「拈花指」轻柔却暗藏杀机，「铁布衫」更是刀枪不入。不过这些绝技，非本门弟子不可轻传。',
        options: [
          { text: '原来如此，晚辈明白了。', isEnd: true },
        ],
      },
      {
        id: 'about',
        speaker: '玄慈方丈',
        text: '少林寺始建于北魏太和十九年，由孝文帝为安顿印度高僧跋陀而建。自达摩祖师东来，在少林寺面壁九年，传下《易筋经》和禅宗教义，少林寺便成为了禅宗祖庭和武学圣地。',
        options: [
          { text: '少林寺果然历史悠久。', nextNodeId: 'history' },
          { text: '那现在少林寺的实力如何？', nextNodeId: 'power' },
        ],
      },
      {
        id: 'history',
        speaker: '玄慈方丈',
        text: '千年来，少林寺历经兴衰。隋末唐初，十三棍僧救唐王，少林寺名声大振。但也因树大招风，曾数次遭劫。好在历代高僧苦心经营，才有了今日的局面。',
        options: [
          { text: '真是一段波澜壮阔的历史。', isEnd: true },
        ],
      },
      {
        id: 'power',
        speaker: '玄慈方丈',
        text: '少林寺弟子众多，光是本寺就有数百僧人。加上俗家弟子和外围势力，实力不容小觑。不过少林寺向来低调，不参与江湖纷争。除非是有人危害武林正道，否则少林寺不会轻易出手。',
        options: [
          { text: '少林不愧为武林泰山北斗。', isEnd: true },
        ],
      },
    ],
  },

  'huashan-master-dialog': {
    id: 'huashan-master-dialog',
    characterId: 'huashan-master',
    startNodeId: 'greeting',
    nodes: [
      {
        id: 'greeting',
        speaker: '岳掌门',
        text: '这位少侠，光临华山派，有何见教？我华山派以剑法闻名天下，「君子剑」的称号可不是浪得虚名。',
        options: [
          { text: '晚辈久仰华山派大名，特来拜访。', nextNodeId: 'visit' },
          { text: '晚辈想学习华山剑法。', nextNodeId: 'learn' },
          { text: '听说华山派有「气宗」和「剑宗」之争？', nextNodeId: 'debate' },
        ],
      },
      {
        id: 'visit',
        speaker: '岳掌门',
        text: '少侠客气了。华山风景秀丽，乃是修行的好地方。少侠若是不嫌弃，可以在山上多住几日，领略一下华山的风光。当然，若是对武学有兴趣，也可以和我派弟子切磋切磋。',
        options: [
          { text: '多谢掌门盛情。', nextNodeId: 'hospitality' },
          { text: '晚辈还有事，就不打扰了。', isEnd: true },
        ],
      },
      {
        id: 'hospitality',
        speaker: '岳掌门',
        text: '好说，好说。来人，带这位少侠去客房歇息。对了，少侠若是有兴趣，明日可以去思过崖看看，那里风景绝佳，还能看到我华山派的一些石刻。',
        options: [
          { text: '思过崖？那里有什么特别吗？', nextNodeId: 'cliff' },
          { text: '多谢掌门，晚辈告辞。', isEnd: true },
        ],
      },
      {
        id: 'cliff',
        speaker: '岳掌门',
        text: '思过崖是我华山派弟子犯错后反省的地方。不过那里确实有些特别，据说当年有一位先辈在崖上刻下了不少武学心得。只是年代久远，很多已经模糊不清了。',
        options: [
          { text: '原来如此，晚辈有机会一定去看看。', isEnd: true },
        ],
      },
      {
        id: 'learn',
        speaker: '岳掌门',
        text: '哦？少侠想学习华山剑法？华山剑法以「奇、险」著称，讲究料敌先机、后发制人。少侠若是真心向学，需先明白一个道理：习武之人，首重武德。',
        options: [
          { text: '请掌门指点。', nextNodeId: 'ethics' },
          { text: '晚辈只想学厉害的剑法。', nextNodeId: 'powerful' },
        ],
      },
      {
        id: 'ethics',
        speaker: '岳掌门',
        text: '好！武德是习武之人的根本。我华山派向来以「君子」自居，讲究的是堂堂正正、光明磊落。若是心术不正，再高的武功也只会危害武林。少侠，你可明白？',
        options: [
          { text: '晚辈受教了。', nextNodeId: 'teach' },
          { text: '晚辈明白了，告辞。', isEnd: true },
        ],
      },
      {
        id: 'powerful',
        speaker: '岳掌门',
        text: '厉害的剑法？少侠，剑法的威力不在于招式本身，而在于使用之人。同样一招「白云出岫」，在我手中和在普通弟子手中，威力天差地别。没有扎实的基础，再精妙的招式也是花架子。',
        options: [
          { text: '掌门教训的是，晚辈知错了。', nextNodeId: 'teach' },
          { text: '晚辈明白了，告辞。', isEnd: true },
        ],
      },
      {
        id: 'teach',
        speaker: '岳掌门',
        text: '好，既然少侠有心向学，我就传授你华山剑法的入门心法。「华山基础剑法」是我华山派的根基，共三十六式。别看招式简单，却是千锤百炼的精华。少侠若是练好这套剑法，日后学习更高深的剑法也能事半功倍。',
        options: [
          { text: '多谢掌门！', isEnd: true },
          { text: '掌门，我听说「独孤九剑」很厉害...', nextNodeId: 'dugu' },
        ],
      },
      {
        id: 'dugu',
        speaker: '岳掌门',
        text: '「独孤九剑」？你从何处听来的？此剑法是剑魔独孤求败所创，招式精妙，号称「无招胜有招」。不过此剑法早已失传，我也只是听闻而已。少侠还是脚踏实地，先练好基础剑法吧。',
        options: [
          { text: '是，晚辈知道了。', isEnd: true },
        ],
      },
      {
        id: 'debate',
        speaker: '岳掌门',
        text: '哼，什么「气宗」「剑宗」！那都是过去的事了。如今我华山派上下一心，哪还有什么宗派之分？少侠，这些闲话就不要提了。',
        options: [
          { text: '是晚辈失言了。', nextNodeId: 'apologize' },
          { text: '可晚辈确实听说了一些传闻...', nextNodeId: 'rumor' },
        ],
      },
      {
        id: 'apologize',
        speaker: '岳掌门',
        text: '无妨。那些都是陈年旧事，不提也罢。我华山派如今兴旺发达，靠的是上下一心，而非门户之见。少侠，习武之人，眼界要开阔，不可拘泥于门户之别。',
        options: [
          { text: '掌门说的是，晚辈受教了。', isEnd: true },
        ],
      },
      {
        id: 'rumor',
        speaker: '岳掌门',
        text: '传闻？什么传闻？无非是些好事之徒的捕风捉影。当年的事，是非曲直，自有公论。如今我华山派一派和气，少侠就不要追问了。',
        options: [
          { text: '是，晚辈不该多问。', isEnd: true },
        ],
      },
    ],
  },

  'wudang-master-dialog': {
    id: 'wudang-master-dialog',
    characterId: 'wudang-master',
    startNodeId: 'greeting',
    nodes: [
      {
        id: 'greeting',
        speaker: '张真人',
        text: '无量寿福。这位道友，光临武当山，不知有何指教？武当乃道教圣地，讲究的是清静无为、道法自然。',
        options: [
          { text: '晚辈久仰张真人大名，特来拜谒。', nextNodeId: 'visit' },
          { text: '晚辈想学习武当太极功夫。', nextNodeId: 'learn' },
          { text: '请问真人，何为「道」？', nextNodeId: 'tao' },
        ],
      },
      {
        id: 'visit',
        speaker: '张真人',
        text: '道友客气了。武当山风景秀丽，金顶日出更是一绝。道友若是不嫌弃，可以在山上多住几日，领略一下道教的清净无为。',
        options: [
          { text: '多谢真人，晚辈正好想请教一些问题。', nextNodeId: 'questions' },
          { text: '晚辈还有事，就不打扰了。', isEnd: true },
        ],
      },
      {
        id: 'questions',
        speaker: '张真人',
        text: '哦？道友有何问题，但说无妨。老道虽然不敢说上知天文下知地理，但活了这把年纪，多少有些见识。',
        options: [
          { text: '请问真人，如何才能成为武林高手？', nextNodeId: 'expert' },
          { text: '请问真人，武当山可有什么秘密？', nextNodeId: 'secret' },
        ],
      },
      {
        id: 'expert',
        speaker: '张真人',
        text: '武林高手？何为高手？若是指武艺高强，那只需勤学苦练即可。但老道以为，真正的高手，不仅要武艺高强，更要有一颗仁者之心。习武是为了强身健体、保护弱小，而非争强好胜。',
        options: [
          { text: '真人说的是，晚辈受教了。', isEnd: true },
        ],
      },
      {
        id: 'secret',
        speaker: '张真人',
        text: '秘密？武当山立派百年，要说没有秘密，那是骗人的。但所谓的秘密，不过是些陈年旧事。真正的大道，就在眼前，何须刻意寻找？',
        options: [
          { text: '晚辈明白了，多谢真人指点。', isEnd: true },
          { text: '可是晚辈听说...', nextNodeId: 'rumor' },
        ],
      },
      {
        id: 'rumor',
        speaker: '张真人',
        text: '听说什么？是说后山的真武大帝像下藏有宝物？还是说真武殿有暗道通往密境？这些传闻，老道听了几十年了。真真假假，假假真真，何必执着？',
        options: [
          { text: '真人教训的是，晚辈告辞。', isEnd: true },
        ],
      },
      {
        id: 'learn',
        speaker: '张真人',
        text: '哦？道友想学习太极功夫？太极讲究以柔克刚、以静制动、后发先至。与其他武学不同，太极更注重领悟，而非苦练。道友，你可明白？',
        options: [
          { text: '请真人指点。', nextNodeId: 'teach' },
          { text: '晚辈想先了解一下太极功夫。', nextNodeId: 'explain' },
        ],
      },
      {
        id: 'explain',
        speaker: '张真人',
        text: '太极功夫，分为「太极拳」和「太极剑」。太极拳重在内功，讲究的是「用意不用力」；太极剑重在招式，讲究的是「无招胜有招」。两者相辅相成，缺一不可。',
        options: [
          { text: '原来如此，请真人赐教！', nextNodeId: 'teach' },
          { text: '晚辈明白了，告辞。', isEnd: true },
        ],
      },
      {
        id: 'teach',
        speaker: '张真人',
        text: '好，既然道友有心向学，老道就传你太极的入门心法。记住，太极的精髓在于「圆」。招式要圆，劲力要圆，心法更要圆。圆则活，活则变，变则通。',
        options: [
          { text: '多谢真人！晚辈定当用心领悟。', isEnd: true },
        ],
      },
      {
        id: 'tao',
        speaker: '张真人',
        text: '何为「道」？这个问题，老道想了一辈子，也不敢说完全明白了。《道德经》说：「道可道，非常道。」能够用语言说出来的道，就不是永恒的道了。',
        options: [
          { text: '请真人详细说说。', nextNodeId: 'tao-explain' },
          { text: '太深奥了，晚辈告辞。', isEnd: true },
        ],
      },
      {
        id: 'tao-explain',
        speaker: '张真人',
        text: '道生一，一生二，二生三，三生万物。万物负阴而抱阳，冲气以为和。在老道看来，道就是自然，就是规律。日出月落，春去秋来，生老病死，这些都是道的体现。',
        options: [
          { text: '那习武和道有什么关系？', nextNodeId: 'tao-martial' },
          { text: '晚辈明白了，多谢真人。', isEnd: true },
        ],
      },
      {
        id: 'tao-martial',
        speaker: '张真人',
        text: '问得好！习武也是求道的一种方式。真正的武学大师，必然是悟道之人。他们的招式看似平平无奇，却暗合天道。当你的武学修为达到一定境界，自然会领悟到：武学的最高境界，就是「无招」。',
        options: [
          { text: '真人说的是，晚辈受教了。', isEnd: true },
        ],
      },
    ],
  },
};

export function getDialog(dialogId: string): Dialog | undefined {
  return DIALOGS[dialogId];
}
