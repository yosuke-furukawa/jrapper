const term = `ねぇ僕たちは巡り合って何年
経つの？今日という日を寝ずに待ってた
朝、めざましの占いを見たよ
ラッキーアニマルはねずみだってさ`

const jrapper = require('..');

jrapper.build().then((tokenizer) => {
  const phrases = jrapper.parse(tokenizer, term)
  const results = jrapper.measure(phrases)
  console.log(results)
})
