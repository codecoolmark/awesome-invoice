const apiKeyDivider = 7;

const randomInteger = () => Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER + 1))
const generateApiKey = () => [randomInteger(), randomInteger(), randomInteger(), randomInteger()]
    .map(x => Math.round((x / (apiKeyDivider + 2))) * apiKeyDivider).join('-')
const validateApiKey = (key) => key.split('-').reduce((valid, x) => valid && (x % apiKeyDivider) === 0, true)

module.exports = {generateApiKey, validateApiKey}