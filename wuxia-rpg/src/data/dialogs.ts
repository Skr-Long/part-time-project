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
        text: '好！施主果然有慧根。老僧这就将《铁布衫》的入门心法传授于你。此乃少林护体内功，练成后防御力大增，寻常兵器难以伤你分毫。',
        options: [
          { 
            text: '多谢大师！晚辈定当铭记于心。', 
            action: 'learn_technique',
            actionData: 'iron-skin',
            isEnd: true 
          },
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
        text: '施主与我少林有缘，老僧可以传授一些入门心法。《铁布衫》是我少林的护体内功，练成后防御力大增，寻常兵器难以伤你分毫。施主若是学好了，日后学习其他武学也能事半功倍。',
        options: [
          { 
            text: '请方丈赐教！',
            action: 'learn_technique',
            actionData: 'iron-skin',
            isEnd: true 
          },
          { text: '晚辈想学习更高深的武学。', nextNodeId: 'advanced' },
        ],
      },
      {
        id: 'advanced',
        speaker: '玄慈方丈',
        text: '高深武学？施主，武学之道，需循序渐进，切不可好高骛远。《易筋经》是我少林的镇寺之宝，非有大机缘、大毅力者不可得。不过...施主若是悟性足够，老僧倒可以破例传授。',
        options: [
          { 
            text: '晚辈悟性尚可，请方丈考验！',
            condition: { type: 'min_attribute', value: 8 },
            nextNodeId: 'teach-yi-jin'
          },
          { text: '方丈教训的是，晚辈知错了。', isEnd: true },
        ],
      },
      {
        id: 'teach-yi-jin',
        speaker: '玄慈方丈',
        text: '好！施主果然有慧根。《易筋经》讲究"易筋洗髓"，能将普通人的筋骨改造成先天灵体。练成后内力深厚无比，且生生不息，无论受多重的内伤都能迅速恢复。',
        options: [
          { 
            text: '多谢方丈！晚辈定当用心领悟！',
            action: 'learn_technique',
            actionData: 'yi-jin',
            isEnd: true 
          },
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
        text: '好，既然少侠有心向学，我就传授你华山剑法的入门心法。《独孤九剑》是剑魔独孤求败所创的绝世剑法，以"无招胜有招"为最高境界。此剑法共有九式，练成后，天下任何兵器、任何招式都可破之。',
        options: [
          { 
            text: '请掌门赐教！',
            action: 'learn_technique',
            actionData: 'du-gu',
            isEnd: true 
          },
          { text: '掌门，此剑法如此精妙，可有更高深的境界？', nextNodeId: 'dugu' },
        ],
      },
      {
        id: 'dugu',
        speaker: '岳掌门',
        text: '更高深的境界？独孤九剑的精髓在于"悟"而非"学"。当年令狐冲大侠仅凭此剑法，以一柄木剑败尽天下英雄。此剑法的最高境界是"无招胜有招"，当你真正领悟了这一点，天下便无人能挡。不过这需要极高的悟性...',
        options: [
          { 
            text: '晚辈愿意用心领悟！',
            condition: { type: 'min_attribute', value: 6 },
            action: 'learn_technique',
            actionData: 'du-gu',
            isEnd: true 
          },
          { text: '晚辈明白了，先从基础学起。', isEnd: true },
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
        text: '好，既然道友有心向学，老道就传你太极的入门心法。《虎爪绝户手》是我武当派的狠辣武功，招招攻向敌人要害。此功模仿猛虎扑食之姿，手指弯曲如虎爪，一抓之下可裂金断石。虽然名为"绝户手"，但武当弟子若非万不得已，绝不轻易使用。',
        options: [
          { 
            text: '请真人赐教！',
            action: 'learn_technique',
            actionData: 'tiger-claw',
            isEnd: true 
          },
          { text: '真人，可还有更高深的武学？', nextNodeId: 'advanced' },
        ],
      },
      {
        id: 'advanced',
        speaker: '张真人',
        text: '更高深的武学？我武当派还有一门《乾坤大挪移》，此功源自明教，但与太极功法有相通之处。此功的核心在于"借力打力"、"四两拨千斤"，能将敌人的攻击原封不动地反弹回去。不过此功极难练成，需要极高的悟性...',
        options: [
          { 
            text: '晚辈愿意用心领悟！',
            condition: { type: 'min_attribute', value: 7 },
            action: 'learn_technique',
            actionData: 'qian-kun',
            isEnd: true 
          },
          { text: '晚辈明白了，先从基础学起。', isEnd: true },
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

  'village-blacksmith-dialog': {
    id: 'village-blacksmith-dialog',
    characterId: 'village-blacksmith',
    startNodeId: 'greeting',
    nodes: [
      {
        id: 'greeting',
        speaker: '王铁匠',
        text: '嘿，年轻人！来我这铁匠铺有何贵干？是要打造兵器，还是修理装备？',
        options: [
          { text: '我想看看铁匠铺的商品。', nextNodeId: 'shop' },
          { text: '我想请教一些武学问题。', nextNodeId: 'martial_question' },
          { text: '只是随便看看。', nextNodeId: 'casual' },
        ],
      },
      {
        id: 'shop',
        speaker: '王铁匠',
        text: '好说好说！我这铁匠铺的东西，那可是方圆百里最好的！无论是刀枪剑戟，还是铠甲护具，应有尽有。你看看，这精钢剑，削铁如泥；这锁子甲，刀枪不入...',
        options: [
          { text: '那我先看看。', isEnd: true },
          { text: '铁匠师傅，我听说你年轻时也是江湖中人？', nextNodeId: 'past_life' },
        ],
      },
      {
        id: 'past_life',
        speaker: '王铁匠',
        text: '哦？你听谁说的？...罢了，也不是什么秘密。老夫年轻时确实在江湖上闯荡过几年，还得了个「铁掌王」的外号。只是后来厌倦了打打杀杀，便回到这老家，开了这家铁匠铺。',
        options: [
          { text: '那师傅为何会厌倦江湖？', nextNodeId: 'why_quit' },
          { text: '师傅可否传授我一些武学？', nextNodeId: 'teach_request' },
        ],
      },
      {
        id: 'why_quit',
        speaker: '王铁匠',
        text: '江湖？哼，江湖就是个是非之地。今天你打我，明天我杀你，永无止境。老夫年轻时也是个热血青年，想要行侠仗义，扬名立万。可后来发现，所谓的「侠义」，不过是强者的借口；所谓的「名声」，不过是过眼云烟。',
        options: [
          { text: '师傅说得是，晚辈受教了。', nextNodeId: 'wise_man' },
          { text: '那师傅认为武学的真谛是什么？', nextNodeId: 'truth_martial' },
        ],
      },
      {
        id: 'truth_martial',
        speaker: '王铁匠',
        text: '武学的真谛？这个问题，老夫想了一辈子。年轻时，我以为武学是用来打人的；后来，我以为武学是用来防身的；现在，我才明白，武学是用来修身的。强健体魄，磨砺心性，这才是武学的根本。至于打人杀人，那只是武学的末技。',
        options: [
          { text: '师傅这番话，让晚辈茅塞顿开！', nextNodeId: 'enlightened' },
          { text: '可是如果不强，怎么保护自己想保护的人？', nextNodeId: 'protect_others' },
        ],
      },
      {
        id: 'protect_others',
        speaker: '王铁匠',
        text: '好问题！你说得对，在这个乱世，没有实力确实寸步难行。但是，实力不等于武力。真正的强者，不仅要有强大的武功，更要有强大的内心。知道什么时候该出手，什么时候该收手；知道为了什么而战，为什么而活。这才是真正的强者。',
        options: [
          { text: '师傅说得对，晚辈明白了。', nextNodeId: 'understand' },
        ],
      },
      {
        id: 'understand',
        speaker: '王铁匠',
        text: '明白就好。来，年轻人，老夫看你根骨不错，又是个可造之材。这套「铁砂掌」的入门心法，你拿去吧。记住，练武如打铁，需要千锤百炼，方能成器。',
        options: [
          { text: '多谢师傅！晚辈定当铭记在心！', isEnd: true },
        ],
      },
      {
        id: 'enlightened',
        speaker: '王铁匠',
        text: '哈哈！好，好，好！难得有你这样的年轻人，能听得进老夫这些唠叨。来，老夫今日高兴，便传你一套真正的本事。看好了，这招「铁臂铜拳」，是我年轻时的得意之作...',
        options: [
          { text: '多谢师傅赐教！', isEnd: true },
        ],
      },
      {
        id: 'wise_man',
        speaker: '王铁匠',
        text: '哎，现在的年轻人，能听得进老人言的不多了。看你还算顺眼，老夫便告诉你一个秘密——这铁匠铺后院，埋着老夫当年用的大刀。那刀虽有些年头了，但依然锋利无比。你若是有兴趣，可以去挖出来看看。',
        options: [
          { text: '真的？那晚辈去看看！', isEnd: true },
        ],
      },
      {
        id: 'teach_request',
        speaker: '王铁匠',
        text: '哦？你想学我的功夫？这可不简单啊。我这套「铁砂掌」，入门容易，但要练到大成，非得吃大苦不可。每天要将双手插入滚烫的铁砂中翻炒，还要用药汤浸泡，至少三年方能小成。你确定要学？',
        options: [
          { text: '弟子不怕吃苦，请师傅传授！', nextNodeId: 'determined' },
          { text: '这...还是算了吧。', nextNodeId: 'give_up' },
        ],
      },
      {
        id: 'determined',
        speaker: '王铁匠',
        text: '好！有这份决心就好！来，我这就传你「铁砂掌」的入门心法和修炼法门。记住，习武如打铁，需反复锤炼，方能成器。切不可半途而废！',
        options: [
          { text: '弟子谨记师傅教诲！', isEnd: true },
        ],
      },
      {
        id: 'give_up',
        speaker: '王铁匠',
        text: '嗯，也无妨。武学之道，贵在心诚。若是没有那份决心，强行修炼反而有害。你若是真对武学感兴趣，可以先从基础练起。比如，每天来我这帮忙打打铁，既能锻炼身体，又能感悟武学道理。',
        options: [
          { text: '师傅说得对，那晚辈便从基础开始。', isEnd: true },
        ],
      },
      {
        id: 'martial_question',
        speaker: '王铁匠',
        text: '哦？武学问题？说来听听。老夫虽然已经退隐江湖，但对武学一道，还是有些心得的。',
        options: [
          { text: '请问师傅，武学之道，何为刚，何为柔？', nextNodeId: 'hard_soft' },
          { text: '请问师傅，如何才能快速提升实力？', nextNodeId: 'quick_power' },
          { text: '请问师傅，实战中最应该注意什么？', nextNodeId: 'combat_tip' },
        ],
      },
      {
        id: 'hard_soft',
        speaker: '王铁匠',
        text: '刚柔之道？好问题！所谓刚，就是力量，是速度，是一往无前的气势；所谓柔，就是技巧，是变化，是四两拨千斤的智慧。刚柔并非对立，而是相辅相成。刚能克柔，柔亦能克刚。真正的武学大师，应该是刚柔并济，收发由心。',
        options: [
          { text: '那如何才能做到刚柔并济呢？', nextNodeId: 'harmony' },
          { text: '师傅说得是，晚辈受教了。', isEnd: true },
        ],
      },
      {
        id: 'harmony',
        speaker: '王铁匠',
        text: '如何做到刚柔并济？这可不是一两句话能说清的。需要你在实战中不断体会，在修炼中反复琢磨。老夫给你一个建议：去观察水。水，至柔也，但水滴石穿；水，至刚也，但随方就圆。水的道，就是刚柔并济的道。',
        options: [
          { text: '观水悟道...晚辈明白了！', nextNodeId: 'water_tao' },
        ],
      },
      {
        id: 'water_tao',
        speaker: '王铁匠',
        text: '哈哈！你能明白这一点，说明你的悟性不差。来，老夫今日高兴，便再传你一些心得。记住，武学的最高境界，是「无招胜有招」。但要达到这个境界，首先要把「有招」练到极致。就像打铁，先要千锤百炼，方能随心所欲。',
        options: [
          { text: '多谢师傅指点！', isEnd: true },
        ],
      },
      {
        id: 'quick_power',
        speaker: '王铁匠',
        text: '快速提升实力？年轻人，听老夫一句劝：欲速则不达。武学之道，没有捷径可走。那些所谓的「速成大法」，不是走火入魔，就是根基不稳。真正的强者，都是一步一个脚印修炼出来的。',
        options: [
          { text: '可是...晚辈想尽快变强，保护身边的人。', nextNodeId: 'protect_motivation' },
          { text: '师傅说得对，是晚辈太心急了。', isEnd: true },
        ],
      },
      {
        id: 'protect_motivation',
        speaker: '王铁匠',
        text: '哦？你是为了保护身边的人才想变强？这倒是个正当的理由。那老夫便告诉你一个办法：实战。实战是提升实力最快的方式。去森林中斩杀野兽，去挑战山寨中的盗贼，去与江湖中的好手切磋。在生死之间，你的潜力会被最大程度地激发出来。',
        options: [
          { text: '晚辈明白了！多谢师傅指点！', isEnd: true },
        ],
      },
      {
        id: 'combat_tip',
        speaker: '王铁匠',
        text: '实战中最应该注意什么？这个问题问得好！老夫告诉你三个字：「留余地」。无论对手是强是弱，都要给自己留一线生机。与人交手，最忌讳的就是轻敌冒进，或者困兽犹斗。记住，狮子搏兔，亦用全力；穷寇莫追，适可而止。',
        options: [
          { text: '「留余地」...晚辈记住了。', nextNodeId: 'remember_tip' },
          { text: '那如果遇到必须拼命的情况呢？', nextNodeId: 'life_death' },
        ],
      },
      {
        id: 'life_death',
        speaker: '王铁匠',
        text: '必须拼命的情况？那就是另一个问题了。若是真到了那一步，那就什么都不要想，什么都不要顾，只想着一件事——活下去。在生死之间，任何技巧都是次要的，最重要的是意志力。只要意志不倒，就有翻盘的可能。',
        options: [
          { text: '晚辈明白了，意志才是最重要的。', isEnd: true },
        ],
      },
      {
        id: 'remember_tip',
        speaker: '王铁匠',
        text: '记住就好。老夫纵横江湖数十年，见过太多天才因为轻敌而陨落，见过太多高手因为贪功而身败。「留余地」这三个字，说起来容易，做起来难。希望你能真正理解其中的含义。',
        options: [
          { text: '晚辈定当谨记师傅教诲！', isEnd: true },
        ],
      },
      {
        id: 'casual',
        speaker: '王铁匠',
        text: '随便看看？也好也好。来，看看我这刚打好的精钢剑，锋利无比！还有这锁子甲，刀枪不入！年轻人，行走江湖，没有一件趁手的兵器和防身的铠甲可不行啊。怎么样，要不要来一件？',
        options: [
          { text: '那我看看有什么好东西。', isEnd: true },
          { text: '还是算了，晚辈先告辞了。', isEnd: true },
        ],
      },
    ],
  },

  'village-martial-master-dialog': {
    id: 'village-martial-master-dialog',
    characterId: 'village-martial-master',
    startNodeId: 'greeting',
    nodes: [
      {
        id: 'greeting',
        speaker: '张馆主',
        text: '这位小兄弟，来我镇武馆有何贵干？是想切磋武艺，还是想拜师学艺？',
        options: [
          { text: '我想与馆主切磋一下武艺。', nextNodeId: 'spar_request' },
          { text: '我想请教一些武学上的问题。', nextNodeId: 'question' },
          { text: '只是路过，随便看看。', nextNodeId: 'casual' },
        ],
      },
      {
        id: 'spar_request',
        speaker: '张馆主',
        text: '哦？想要切磋？好，年轻人有这份勇气可嘉。不过，切磋归切磋，点到为止，可不能伤了和气。你先说说，你想用什么兵器？刀剑枪棍，还是拳脚功夫？',
        options: [
          { text: '我用拳脚功夫，请馆主指教！', nextNodeId: 'fist_spar' },
          { text: '我用剑，请馆主指教！', nextNodeId: 'sword_spar' },
          { text: '还是算了，晚辈怕不是馆主对手。', nextNodeId: 'afraid' },
        ],
      },
      {
        id: 'fist_spar',
        speaker: '张馆主',
        text: '拳脚功夫？好！老夫最擅长的就是拳脚。来，让我看看你的根基如何。记住，出招要稳，下盘要实，不要花架子，要管用的招式。',
        options: [
          { text: '请馆主赐教！', isEnd: true },
        ],
      },
      {
        id: 'sword_spar',
        speaker: '张馆主',
        text: '用剑？好！剑乃百兵之君，讲究的是轻灵飘逸，料敌先机。来，让我看看你的剑法如何。记住，剑不是用来砍的，是用来刺的；不是用来硬拼的，是用来找破绽的。',
        options: [
          { text: '请馆主赐教！', isEnd: true },
        ],
      },
      {
        id: 'afraid',
        speaker: '张馆主',
        text: '哦？怕了？这也正常。老夫年轻时也怕过，怕输，怕受伤，怕丢人。但是，怕解决不了任何问题。只有勇敢面对，才能不断成长。怎么样，要不要再试一次？',
        options: [
          { text: '馆主说得对，晚辈要挑战！', nextNodeId: 'brave_again' },
          { text: '还是算了，晚辈还是先提升实力再说。', isEnd: true },
        ],
      },
      {
        id: 'brave_again',
        speaker: '张馆主',
        text: '好！有这份勇气就够了！来，不管你用什么兵器，不管你用什么招式，尽管攻过来。老夫让你三招，让你见识见识什么叫「人外有人，天外有天」。',
        options: [
          { text: '多谢馆主！晚辈来了！', isEnd: true },
        ],
      },
      {
        id: 'question',
        speaker: '张馆主',
        text: '哦？有问题要请教？但说无妨。老夫虽然不是什么武学宗师，但在这镇上，也算是有几分见识。',
        options: [
          { text: '请问馆主，练武最重要的是什么？', nextNodeId: 'most_important' },
          { text: '请问馆主，如何才能突破瓶颈？', nextNodeId: 'breakthrough' },
          { text: '请问馆主，内功和外功哪个更重要？', nextNodeId: 'internal_external' },
        ],
      },
      {
        id: 'most_important',
        speaker: '张馆主',
        text: '练武最重要的是什么？这个问题，不同的人有不同的答案。有人说是天赋，有人说是勤奋，有人说是机缘。但以老夫之见，练武最重要的，是「心」。',
        options: [
          { text: '「心」？请馆主详细说说。', nextNodeId: 'heart_explain' },
        ],
      },
      {
        id: 'heart_explain',
        speaker: '张馆主',
        text: '是的，心。练武先练心。心正，则路正；心坚，则功成。什么是心正？就是练武的目的要正。是为了强身健体，还是为了争强好胜？是为了行侠仗义，还是为了欺凌弱小？目的不同，结果自然不同。',
        options: [
          { text: '那心坚呢？', nextNodeId: 'heart_stubborn' },
        ],
      },
      {
        id: 'heart_stubborn',
        speaker: '张馆主',
        text: '心坚，就是要有恒心，有毅力。武学之道，没有捷径可走。那些所谓的「天才」，不过是比别人更勤奋，比别人更能坚持而已。一天不练自己知道，两天不练同行知道，三天不练天下知道。这句话，你要记住。',
        options: [
          { text: '晚辈记住了，多谢馆主教诲！', isEnd: true },
        ],
      },
      {
        id: 'breakthrough',
        speaker: '张馆主',
        text: '突破瓶颈？这是每个习武之人都会遇到的问题。当你的武功练到一定程度，就会感觉无论怎么努力，都难以再进一步。这就是所谓的「瓶颈」。如何突破瓶颈？老夫有三个建议。',
        options: [
          { text: '请馆主指教！', nextNodeId: 'three_advices' },
        ],
      },
      {
        id: 'three_advices',
        speaker: '张馆主',
        text: '第一，停下来反思。有时候，一味苦练反而会误入歧途。停下来，回顾自己的修炼之路，看看是不是哪里走错了方向。第二，出去走走。读万卷书不如行万里路，见多才能识广。与不同的人交手，看不同的风景，也许会有新的感悟。第三，放下执念。有时候，瓶颈不是因为你不够强，而是因为你太想突破。放下「必须突破」的执念，顺其自然，也许反而会有意想不到的收获。',
        options: [
          { text: '馆主这番话，让晚辈茅塞顿开！', isEnd: true },
        ],
      },
      {
        id: 'internal_external',
        speaker: '张馆主',
        text: '内功和外功哪个更重要？这个问题，老夫年轻时也困惑过。外功练的是招式，是筋骨，是杀人的技巧；内功练的是真气，是脏腑，是生命力的根源。两者相辅相成，缺一不可。',
        options: [
          { text: '那馆主认为应该先练哪个？', nextNodeId: 'which_first' },
          { text: '那有没有高下之分？', nextNodeId: 'which_higher' },
        ],
      },
      {
        id: 'which_first',
        speaker: '张馆主',
        text: '先练哪个？老夫的建议是，先外后内。年轻人气血方刚，筋骨强健，正是练外功的好时候。外功练到一定程度，自然会接触到内功。就像水到渠成，瓜熟蒂落，强求不得。当然，这只是老夫的个人见解，每个人的情况不同，适合的路也不同。',
        options: [
          { text: '晚辈明白了，多谢馆主指点！', isEnd: true },
        ],
      },
      {
        id: 'which_higher',
        speaker: '张馆主',
        text: '高下之分？内功和外功，本无高下之分，只有运用之别。内功深厚者，可以摘花飞叶皆可伤人；外功精湛者，可以一力降十会。真正的高手，应该是内外兼修，刚柔并济。过分强调内功或外功，都是偏见。',
        options: [
          { text: '馆主说得对，晚辈受教了。', isEnd: true },
        ],
      },
      {
        id: 'casual',
        speaker: '张馆主',
        text: '随便看看？也好也好。来，看看我这些弟子们练得如何。习武之人，讲究的是「冬练三九，夏练三伏」。没有这份苦功，怎么能出人头地？年轻人，你说是也不是？',
        options: [
          { text: '馆主说得是，练武确实需要吃苦。', isEnd: true },
          { text: '晚辈还有事，先告辞了。', isEnd: true },
        ],
      },
    ],
  },

  'peach-garden-lady-dialog': {
    id: 'peach-garden-lady-dialog',
    characterId: 'peach-garden-lady',
    startNodeId: 'greeting',
    nodes: [
      {
        id: 'greeting',
        speaker: '黄姑娘',
        text: '你终于来了。我已在此等候多时。',
        options: [
          { text: '姑娘认识我？', nextNodeId: 'know_you' },
          { text: '姑娘为何在此等候？', nextNodeId: 'why_wait' },
          { text: '姑娘的琴声，似乎蕴含着武学道理...', nextNodeId: 'music_martial' },
        ],
      },
      {
        id: 'know_you',
        speaker: '黄姑娘',
        text: '认识你？不，我并不认识你。但我知道，会来这桃花岛的，都不是普通人。或是有缘人，或是有心人，或是...痴情人。你是哪一种？',
        options: [
          { text: '我...我不知道。', nextNodeId: 'dont_know' },
          { text: '我想我是有缘人。', nextNodeId: 'destined' },
          { text: '我是为武学而来。', nextNodeId: 'for_martial' },
        ],
      },
      {
        id: 'dont_know',
        speaker: '黄姑娘',
        text: '不知道？这倒是个有趣的答案。很多人活了一辈子，也不知道自己是谁，想要什么。你能承认自己不知道，反而说明你比大多数人清醒。既然如此，我便送你一句话：「 Follow your heart.」',
        options: [
          { text: '「跟随你的心」...晚辈明白了。', nextNodeId: 'follow_heart' },
          { text: '恕晚辈愚钝，还请姑娘明示。', nextNodeId: 'more_clear' },
        ],
      },
      {
        id: 'follow_heart',
        speaker: '黄姑娘',
        text: '明白就好。你的心会告诉你该往哪里去，该做什么。现在，告诉我，你的心在告诉你什么？',
        options: [
          { text: '它告诉我...要向姑娘请教武学。', nextNodeId: 'ask_teach' },
          { text: '它告诉我...要更多地了解姑娘。', nextNodeId: 'know_more' },
        ],
      },
      {
        id: 'more_clear',
        speaker: '黄姑娘',
        text: '明示？有些事情，是无法用语言表达的。就像这琴声，你能听懂多少，全凭你的悟性。我问你，你从我的琴声中，听到了什么？',
        options: [
          { text: '听到了悲伤和孤独。', nextNodeId: 'sad_lonely' },
          { text: '听到了自由和洒脱。', nextNodeId: 'free_free' },
          { text: '听到了武学的韵律。', nextNodeId: 'martial_rhythm' },
        ],
      },
      {
        id: 'sad_lonely',
        speaker: '黄姑娘',
        text: '悲伤和孤独？...也许吧。每个人的心中，都有一些不为人知的故事。但你能听出这些，说明你是个有心人。来，让我看看，你的心中，又藏着什么样的故事？',
        options: [
          { text: '晚辈的故事，不值一提。', nextNodeId: 'not_worth' },
          { text: '晚辈愿意与姑娘分享。', nextNodeId: 'share_story' },
        ],
      },
      {
        id: 'free_free',
        speaker: '黄姑娘',
        text: '自由和洒脱？哈哈，你倒是第一个这么说的人。也许，你听到的不是我的琴声，而是你自己内心的渴望。告诉我，你渴望自由吗？',
        options: [
          { text: '当然渴望！谁不渴望自由？', nextNodeId: 'want_free' },
          { text: '自由...需要实力来守护。', nextNodeId: 'need_power' },
        ],
      },
      {
        id: 'martial_rhythm',
        speaker: '黄姑娘',
        text: '哦？你听出了武学的韵律？这可不简单。音乐与武学，本就有相通之处。节奏、韵律、变化、和谐...这些都是两者共同的追求。你能听出这些，说明你的悟性不差。',
        options: [
          { text: '那姑娘可否教我这种「音武合一」的境界？', nextNodeId: 'teach_music' },
          { text: '晚辈只是略有所感，还请姑娘指点。', nextNodeId: 'please_guide' },
        ],
      },
      {
        id: 'teach_music',
        speaker: '黄姑娘',
        text: '教你？这可不是一朝一夕能学会的。「音武合一」的境界，需要对音乐和武学都有极深的理解，更需要极高的悟性。不过，既然你与我有缘，我便传你一些入门法门。记住，音乐的最高境界是「无声」，武学的最高境界是「无招」。',
        options: [
          { text: '「无声胜有声」...晚辈受教了！', isEnd: true },
        ],
      },
      {
        id: 'destined',
        speaker: '黄姑娘',
        text: '有缘人？你倒是很有自信。不过，自信是好的。我且问你，你说你是有缘人，那我们的缘，是什么缘？是善缘，还是孽缘？是情缘，还是武缘？',
        options: [
          { text: '我希望...是各种好的缘分。', nextNodeId: 'good_fate' },
          { text: '我希望...能向姑娘学习武学。', nextNodeId: 'learn_wushu' },
        ],
      },
      {
        id: 'for_martial',
        speaker: '黄姑娘',
        text: '为武学而来？倒是个实在人。武学一道，你现在到了什么境界？是「手中有招，心中无招」，还是「手中无招，心中有招」，或是...「手中无招，心中也无招」？',
        options: [
          { text: '晚辈...还在「手中有招，心中有招」的阶段。', nextNodeId: 'stage_one' },
          { text: '晚辈不太明白这些境界。', nextNodeId: 'dont_understand' },
        ],
      },
      {
        id: 'stage_one',
        speaker: '黄姑娘',
        text: '「手中有招，心中有招」？这说明你的基础打得不错，但是还拘泥于招式。要想更上一层楼，就要学会「忘招」。当你不再依赖招式，而是随心所欲、顺势而为的时候，你就突破了。',
        options: [
          { text: '「忘招」...这如何做到？', nextNodeId: 'how_forget' },
          { text: '晚辈明白了，多谢姑娘指点！', isEnd: true },
        ],
      },
      {
        id: 'how_forget',
        speaker: '黄姑娘',
        text: '如何忘招？这可不是教出来的，是悟出来的。给你一个建议：去经历，去感受，去忘记你所学的一切。当你在生死关头，本能地使出的招式，才是真正属于你的招式。那个时候，你就「忘招」了。',
        options: [
          { text: '晚辈明白了！', isEnd: true },
        ],
      },
      {
        id: 'why_wait',
        speaker: '黄姑娘',
        text: '为何在此等候？因为...我在等一个能听懂我琴声的人。这桃花岛看似美丽，实则寂寞。春去秋来，花开花落，唯有这琴声，能陪伴我度过这漫长的岁月。',
        options: [
          { text: '姑娘...很孤独吗？', nextNodeId: 'are_you_lonely' },
          { text: '那姑娘等到了吗？', nextNodeId: 'waited_yet' },
        ],
      },
      {
        id: 'are_you_lonely',
        speaker: '黄姑娘',
        text: '孤独？...也许吧。但孤独也有孤独的好处。在孤独中，人才能真正地面对自己，了解自己。你试过一个人在桃花林中坐一整天吗？什么也不想，什么也不做，只是看着花瓣飘落，听着风声鸟鸣。那个时候，你会发现，世界原来可以如此安静，如此美好。',
        options: [
          { text: '姑娘的心境，晚辈望尘莫及。', nextNodeId: 'cannot_reach' },
          { text: '那姑娘...愿意让晚辈陪伴吗？', nextNodeId: 'want_accompany' },
        ],
      },
      {
        id: 'cannot_reach',
        speaker: '黄姑娘',
        text: '望尘莫及？不必如此。每个人都有自己的路，自己的心境。我的路，未必适合你；你的风景，我也未必能见到。重要的是，找到属于你自己的道路，看到属于你自己的风景。',
        options: [
          { text: '多谢姑娘教诲！晚辈告辞了。', isEnd: true },
        ],
      },
      {
        id: 'want_accompany',
        speaker: '黄姑娘',
        text: '陪伴我？...你可知道，在这桃花岛陪伴我，意味着什么？意味着你可能要留在这里很长时间，意味着你可能会错过江湖上的很多事，意味着...你可能会与我产生某种...羁绊。你确定要这么做吗？',
        options: [
          { text: '我确定！我愿意留下来陪伴姑娘。', nextNodeId: 'determined_stay' },
          { text: '这...晚辈需要再想想。', nextNodeId: 'need_think' },
        ],
      },
      {
        id: 'determined_stay',
        speaker: '黄姑娘',
        text: '...好吧。既然你心意已决，我便不再推辞。不过，在这桃花岛陪伴我，可不能什么都不做。每日清晨，随我练剑；每日午后，随我抚琴；每日傍晚，随我研读武学典籍。你可愿意？',
        options: [
          { text: '愿意！晚辈愿意听从姑娘安排！', isEnd: true },
        ],
      },
      {
        id: 'need_think',
        speaker: '黄姑娘',
        text: '需要想想？这也正常。毕竟，这不是一个容易做的决定。江湖路远，有太多的可能性；而留在这桃花岛，意味着你选择了另一种人生。你...真的想好了吗？',
        options: [
          { text: '我...我想我还是选择江湖路。', nextNodeId: 'choose_jianghu' },
          { text: '但我还是希望能向姑娘学习武学。', nextNodeId: 'still_want_learn' },
        ],
      },
      {
        id: 'choose_jianghu',
        speaker: '黄姑娘',
        text: '选择江湖路？也好也好。江湖虽然危险，但也精彩。去吧，去经历，去成长，去找到属于你自己的道路。记住，无论你走多远，这桃花岛的大门，永远为你敞开。',
        options: [
          { text: '多谢姑娘！晚辈告辞了！', isEnd: true },
        ],
      },
      {
        id: 'still_want_learn',
        speaker: '黄姑娘',
        text: '还是想学习武学？好吧。我可以传你一些桃花岛的武学，但你要记住，武学只是手段，不是目的。你想用武学报答什么，守护什么，追求什么，这些才是最重要的。',
        options: [
          { text: '晚辈记住了！请姑娘赐教！', isEnd: true },
        ],
      },
      {
        id: 'waited_yet',
        speaker: '黄姑娘',
        text: '等到了吗？...你说呢？如果你没来到这桃花岛，没听到我的琴声，没站在我面前问这个问题，我的等待，也许就会一直继续下去。但现在，你来了。这...算不算是等到了呢？',
        options: [
          { text: '我希望...这正是姑娘等待的。', nextNodeId: 'hope_so' },
          { text: '姑娘等待的...是什么样的人？', nextNodeId: 'wait_who' },
        ],
      },
      {
        id: 'hope_so',
        speaker: '黄姑娘',
        text: '希望如此？...也许吧。来，既然你来到了这桃花岛，便是有缘人。我便传你一套桃花岛的绝学——「凌波微步」。这套轻功，讲究的是步法飘逸，如仙似幻。你看好了...',
        options: [
          { text: '多谢姑娘！晚辈定当用心学习！', isEnd: true },
        ],
      },
      {
        id: 'wait_who',
        speaker: '黄姑娘',
        text: '我等待的是什么样的人？...一个能与我琴瑟和鸣的人，一个能与我论武谈道的人，一个...能懂我的人。你觉得，你是这样的人吗？',
        options: [
          { text: '我不知道...但我愿意尝试去了解姑娘。', nextNodeId: 'try_understand' },
          { text: '晚辈不敢妄言，但我想向姑娘学习。', nextNodeId: 'want_to_learn' },
        ],
      },
      {
        id: 'music_martial',
        speaker: '黄姑娘',
        text: '哦？你听出了武学道理？这倒是难得。我的琴声，确实融入了一些武学心得。你能听出这些，说明你的悟性不低。来，告诉我，你具体听出了什么？',
        options: [
          { text: '听出了节奏和变化，如同招式的攻守。', nextNodeId: 'rhythm_change' },
          { text: '听出了意境，仿佛置身于武学的至高境界。', nextNodeId: 'artistic_conception' },
          { text: '听出了...姑娘的心意。', nextNodeId: 'heart_intent' },
        ],
      },
      {
        id: 'rhythm_change',
        speaker: '黄姑娘',
        text: '节奏和变化，如同招式的攻守？说得好！音乐与武学，确实有许多相通之处。音乐有节奏，武学有章法；音乐有旋律变化，武学有招式往来。你能领悟到这一层，说明你的基础已经相当扎实了。',
        options: [
          { text: '那姑娘可否指点我更上一层楼？', nextNodeId: 'guide_me' },
        ],
      },
      {
        id: 'guide_me',
        speaker: '黄姑娘',
        text: '指点你？好吧。既然你与我桃花岛有缘，我便传你一套「落英神剑掌」。这套掌法，招式飘逸，如落英缤纷，看似柔美，实则暗藏杀机。你看好了，这是第一招「万紫千红」...',
        options: [
          { text: '多谢姑娘赐教！', isEnd: true },
        ],
      },
      {
        id: 'artistic_conception',
        speaker: '黄姑娘',
        text: '意境？你能听出意境，这说明你的悟性极高。武学的最高境界，确实是「意境」二字。当你的武学修为达到一定程度，招式就不再重要了，重要的是你出招时的「意」。你能听懂我的琴声中的意境，说明你已经触碰到了这个境界的边缘。',
        options: [
          { text: '那如何才能真正达到这个境界？', nextNodeId: 'how_to_reach' },
        ],
      },
      {
        id: 'how_to_reach',
        speaker: '黄姑娘',
        text: '如何达到？这需要「悟」。怎么悟？去经历，去感受，去思考。当你在某个时刻，突然明白了什么，那就是「悟」了。这个过程，无法教，无法学，只能靠你自己。不过，我可以给你一些提示——去感受这桃花岛的一草一木，去聆听这天地间的万籁之声。也许，你会有所收获。',
        options: [
          { text: '晚辈明白了！多谢姑娘指点！', isEnd: true },
        ],
      },
      {
        id: 'heart_intent',
        speaker: '黄姑娘',
        text: '我的心意？...你倒是很有意思。好吧，既然你想听，我便告诉你——我的琴声中，确实藏着我的心意。这份心意，是什么呢？是孤独？是期盼？是追忆？还是...别的什么？你愿意花时间去了解吗？',
        options: [
          { text: '我愿意！我想更多地了解姑娘。', nextNodeId: 'want_to_know_more' },
          { text: '晚辈...还是想先学习武学。', nextNodeId: 'prioritize_wushu' },
        ],
      },
      {
        id: 'want_to_know_more',
        speaker: '黄姑娘',
        text: '想更多地了解我？...好吧。那你便留在这桃花岛一段时间。每日清晨，随我练剑；每日午后，听我抚琴；每日傍晚，陪我看夕阳。在这段时间里，你可以慢慢了解我。当然，作为回报，我也会教你桃花岛的武学。你可愿意？',
        options: [
          { text: '愿意！晚辈愿意！', isEnd: true },
        ],
      },
      {
        id: 'prioritize_wushu',
        speaker: '黄姑娘',
        text: '先学习武学？也好。武学确实是立世之本。来，我便传你桃花岛的绝学。但你要记住，武学只是工具，人才是根本。不要让武学遮蔽了你的心，不要让招式束缚了你的意。',
        options: [
          { text: '晚辈记住了！请姑娘赐教！', isEnd: true },
        ],
      },
    ],
  },
};

export function getDialog(dialogId: string): Dialog | undefined {
  return DIALOGS[dialogId];
}
