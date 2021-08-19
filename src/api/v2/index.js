module.exports = context => ({
  projects: require('./projects')(context),
  recordings: require('./recordings')(context),
  voices: require('./voices')(context),
  clips: require('./clips')(context),
})