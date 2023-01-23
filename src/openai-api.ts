import openai from 'openai'

const configuration = new openai.Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const aiApi = new openai.OpenAIApi(configuration)

export default aiApi
