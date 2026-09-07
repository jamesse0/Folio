import client from './client'

export const getCode = () => client.get('/portfolio/code')
export const regenerateCode = () => client.post('/portfolio/code/regenerate')
export const getPortfolio = (code) => client.get(`/portfolio/${code}`)