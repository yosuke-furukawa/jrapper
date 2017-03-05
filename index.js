'use strict'

const path = require('path')
const kuromoji = require('kuromoji')
const japanese = require('japanese')
const collator = new Intl.Collator('en', { sensitivity: 'base' })

const expectPos = ['名詞', '動詞', '助詞', '助動詞']
const connectLongPos = ['名詞', '接頭詞', '形容詞', '形容動詞', '動詞', '接続詞', '連体詞', '助詞', '副詞', '助動詞']
const connectShortPos = ['名詞', '接頭詞', '形容詞', '形容動詞', '接続詞', '連体詞', '副詞']
const unexpectPronunciation = ['、', '。']
const defaultVibes = 8
const defaultMaxPhraseNums = Infinity
const defaultDicPath = path.resolve(__dirname, 'dict')

module.exports.build = (opts = {
  dicPath: defaultDicPath
}) => new Promise((resolve, reject) => {
  const builder = kuromoji.builder({
    dicPath: opts.dicPath
  })
  builder.build((err, tokenizer) => {
    if (err) {
      return reject(err)
    }
    return resolve(tokenizer)
  })
})

const reverse = (s) => s.split('').reverse().join('')
const bonusLength = 10
const calcVibes = (w1, w2, weight = 1) => {
  let vibes = 0
  // shorter length
  const length = w1.length < w2.length ? w1.length : w2.length;
  for (let i = 0; i < length; i++) {
    let c1 = w1.charAt(i)
    let c2 = w2.charAt(i)
    
    if (i === 0 && c1 !== c2 && collator.compare(c1, c2) !== 0) {
      return vibes
    }
    if (i === 1 && c1 !== c2 && collator.compare(c1, c2) !== 0) {
      return vibes
    }
    if (i === 2 && c1 !== c2 && collator.compare(c1, c2) !== 0) {
      return vibes
    }

    if (c1 === c2) {
      if (c1 === '*') {
        vibes += 0.01
      } else {
        if (i < bonusLength) {
          vibes += (1 + ((bonusLength - i) / 10))/2
        } else {
          vibes += 0.01
        }
      }
    } else {
      if (collator.compare(c1, c2) === 0) {
        if (i < bonusLength) {
          vibes += (0.5 + ((bonusLength - i) / 10))/2
        } else {
        }
      }
    }
  }
  return vibes * weight
}

const createPhrase = (tokens, i, connectPos) => {
  const token = tokens[i]
  const word = {
    pos: token.pos,
    surface_form: token.surface_form,
    pronunciation: token.pronunciation
  }
  let j = i - 1
  let phraseNums = 0
  while (j >= 0) {
    const prevToken = tokens[j]
    if (prevToken.surface_form === '、') break
    if (phraseNums > defaultMaxPhraseNums) break
    if (connectPos.includes(prevToken.pos)) {
      word.surface_form = prevToken.surface_form + word.surface_form
      word.pronunciation = (prevToken.pronunciation ? prevToken.pronunciation : prevToken.surface_form) + (word.pronunciation ? word.pronunciation : word.surface_form)
    } else {
      break
    }
    j--
    phraseNums++
  }
  return word
}

module.exports.parse = (tokenizer, input) => {
  const tokens = tokenizer.tokenize(input)

  let words = []

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.surface_form === '、') continue
    if (expectPos.includes(token.pos)) {
        // greed
      const lp = createPhrase(tokens, i, connectLongPos)
      lp && words.push(lp)
        // not so greed
      const sp = createPhrase(tokens, i, connectShortPos)
      sp && sp.surface_form !== lp.surface_form && words.push(sp)
    }
  }

  const results = words
      .filter((word) => !unexpectPronunciation.includes(word.pronunciation))
      .map((word) => {
        if (word.pronunciation) {
          word.romaji = japanese.romanize(word.pronunciation)
        } else if (word.surface_form) {
          word.romaji = japanese.romanize(word.surface_form)
        }
        return word
      })
      .map((word) => {
        word.romaji = word.romaji.replace(/sh/g, 's')
        word.romaji = word.romaji.replace(/ts/g, 't')
        return word
      })
      .map((word) => {
        word.rhymorpheme = word.romaji.replace(/[bcdfghjklmnpqrstvwxyz]/g, '*')
        word.vowel = word.romaji.replace(/[bcdfghjklmnpqrstvwxyz]/g, '')
        word.reversedRhymorpheme = reverse(word.rhymorpheme)
        return word
      })

  return results
}

module.exports.measure = (words, options = { vibes: defaultVibes }) => {
  let rhymes = []

  for (let i = 0; i < words.length; i++) {
    for (let j = i; j < words.length; j++) {
      if (i === j) {
        continue
      }
      const w1 = words[i]
      const w2 = words[j]

      
      if (w1.surface_form === w2.surface_form) {
        continue
      }

      if (w2.surface_form.indexOf(w1.surface_form) >= 0 || w1.surface_form.indexOf(w2.surface_form) >= 0) {
        continue
      }

      let vibes = 0
      vibes += calcVibes(w1.vowel, w2.vowel, 0.75)
      vibes += calcVibes(reverse(w1.vowel), reverse(w2.vowel), 2)
      if (w1.surface_form === '今日という日を寝ずに待ってた' && w2.surface_form === 'ラッキーアニマルはねずみだってさ') console.log(vibes);

      if (vibes > options.vibes) {
        rhymes.push({
          w1,
          w2,
          vibes
        })
      }
    }
  }
  return rhymes
}

