module.exports = {
  error: (e) => ({
    success: false,
    message: `Library error: ${e}`
  })
}