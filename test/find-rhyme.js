const assert = require('assert')
const { build, parse, measure } = require('../')

function hasPhrase (actuals, w1, w2) {
  assert(actuals.some(actual => actual.w1.surface_form === w1 && actual.w2.surface_form === w2))
}

function test (tokenizer, input, w1, w2, vibes) {
  const result = parse(tokenizer, input)
  const rhymes = measure(result, vibes)
  hasPhrase(rhymes, w1, w2)
}

build().then(tokenizer => {
  test(tokenizer, '今日はとても良い天気ですね。こんな日は自然に元気になります。', '今日はとても良い天気', 'こんな日は自然に元気')

  test(tokenizer, '後始末するアノニマス', '後始末', 'アノニマス')

  {
    const parsed = parse(tokenizer, '串刺し 踏み台  無理矢理')
    const rhymes = measure(parsed)
    hasPhrase(rhymes, '串刺し', '踏み台')
    hasPhrase(rhymes, '串刺し', '無理矢理')
    hasPhrase(rhymes, '踏み台', '無理矢理')
  }

  test(tokenizer, '謹賀新年 みんな人間', '謹賀新年', 'みんな人間')

  test(tokenizer, 'ハナミズキに返り討ち', 'ハナミズキ', '返り討ち', {vibes: 7})

  test(tokenizer, '水墨画を食べるぐりとぐら', '水墨画', 'ぐりとぐら', { vibes: 10 })

  test(tokenizer, '「ゲスの極み乙女。」と「ケツのきわにお米。」', 'ゲスの極み乙女', 'ケツのきわにお米', { vibes: 10 })
})

