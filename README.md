# rapper

`rapper` can detect `Japanese rhyme` in text. `rapper` analyzes morphemes then detect phrases and detect rhyming words.

example:

```
'今日はとても良い天気ですね。こんな日は自然に元気になります。'

'今日はとても良い天気' 'こんな日は自然に元気'
```

```
const rapper = require('rapper')

rapper.build().then((tokenizer) => {
  const rhymes = rapper.measure(
    rapper.parse(tokenizer, '後始末するアノニマス')
  );
  console.log(rhymes)
  // [ { w1:
  //     { pos: '名詞',
  //       surface_form: '後始末',
  //       pronunciation: 'アトシマツ',
  //       romaji: 'atosimatu',
  //       rhymorpheme: 'a*o*i*a*u',
  //       vowel: 'aoiau',
  //       reversedRhymorpheme: 'u*a*i*o*a' },
  //       w2:
  //     { pos: '名詞',
  //       surface_form: 'アノニマス',
  //       pronunciation: undefined,
  //       romaji: 'anonimasu',
  //       rhymorpheme: 'a*o*i*a*u',
  //       vowel: 'aoiau',
  //       reversedRhymorpheme: 'u*a*i*o*a' },
  //    vibes: 11 } ]
})
```

# install

```
npm install rapper
```
