const rapper = require('..')

rapper.build().then((tokenizer) => {
  const rhymes = rapper.measure(
    rapper.parse(tokenizer, '後始末するアノニマス')
  )
  console.log(rhymes)
})
