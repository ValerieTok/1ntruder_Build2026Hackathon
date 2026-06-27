export default function handler(req, res) {
  res.status(200).json({
    injectUrl: process.env.BOTPRESS_WEBCHAT_INJECT_URL || '',
    configUrl: process.env.BOTPRESS_WEBCHAT_CONFIG_URL || '',
  })
}
