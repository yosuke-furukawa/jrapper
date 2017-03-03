const jrapper = require('..')

jrapper.build().then((tokenizer) => {
  const rhymes = jrapper.measure(
    jrapper.parse(tokenizer, '後始末するアノニマス')
  )
  console.log(rhymes)
})
