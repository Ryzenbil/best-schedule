// api.js
const API_URL = `${import.meta.env.VITE_API_URL}/graphql`

export async function graphqlRequest(query, variables = {}) {
  const token = localStorage.getItem('token')

  let response
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: 'Bearer ' + token })
      },
      body: JSON.stringify({ query, variables })
    })
  } catch (networkError) {
    console.error('Network error:', networkError)
    throw new Error('Нет соединения с сервером')
  }

  if (response.status === 401) {
    console.warn('Unauthorized – токен недействителен, очищаем')
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('Сессия истекла, перенаправление на логин')
  }

  if (!response.ok) {
    const text = await response.text()
    console.error(`HTTP ${response.status}:`, text)
    throw new Error(`Ошибка HTTP: ${response.status}`)
  }

  let result
  try {
    result = await response.json()
  } catch (parseError) {
    console.error('Ошибка парсинга JSON:', parseError)
    throw new Error('Неверный ответ сервера')
  }

  if (result.errors && result.errors.length) {
    const firstError = result.errors[0]
    console.error('GraphQL error details:', JSON.stringify(firstError, null, 2))

    const isMeQuery = query.includes('query { me ')
    const isInternalError = firstError.message.includes('INTERNAL_ERROR')
    const isClassCast = firstError.message.includes('ClassCastException')

    if (isMeQuery || isClassCast) {
      console.warn('Обнаружена критическая ошибка GraphQL, очищаем токен и редиректим на логин')
      localStorage.removeItem('token')
      window.location.href = '/login'
      throw new Error('Ошибка авторизации, пожалуйста, войдите снова')
    }

    throw new Error(firstError.message)
  }

  return result.data
}