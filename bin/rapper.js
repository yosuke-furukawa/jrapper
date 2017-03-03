#!/usr/bin/env node

const minimist = require('minimist')
const opts = minimist(process.argv.slice(2))

function showHelp () {
  console.log(`
    rapper [--dicpath dictionary directroy default kuromoji default dictionary] [--vibes threshold for rhyme terms default 8]

    rapper 'ハナミズキに返り討ち'
    rapper --dicpath /path/to/dictionary --vibes 5 'ハナミズキに返り討ち'
  `)
}

if (opts.h || opts.help) {
  showHelp()
  process.exit(0)
}

if (opts.v || opts.version) {
  const pack = require('../package.json')
  console.log(pack.version)
  process.exit(0)
}

if (!opts._.length) {
  showHelp()
  process.exit(1)
}

const message = opts._[0]

const {build, parse, measure} = require('..')

build({ dicPath: opts.dicPath }).then((tokenizer) => {
  const phrase = parse(tokenizer, message)
  const rhymes = measure(phrase, { vibes: opts.vibes })
  if (!rhymes.length) {
    console.log('cannot found rhymes')
  }

  rhymes.forEach((rhyme) => {
    const word1 = rhyme.w1.surface_form
    const word2 = rhyme.w2.surface_form
    const vibes = rhyme.vibes
    console.log(word1, word2, `vibes=${vibes}`)
  })
})
