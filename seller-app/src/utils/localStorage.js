export const saveToken = (token) => {
  localStorage.setItem('token', token)
}

export const getToken = () => {
  return localStorage.getItem('token')
}

export const removeToken = () => {
  localStorage.removeItem('token')
}

export const saveSeller = (seller) => {
  localStorage.setItem('seller', JSON.stringify(seller))
}

export const getSeller = () => {
  const seller = localStorage.getItem('seller')
  return seller ? JSON.parse(seller) : null
}

export const removeSeller = () => {
  localStorage.removeItem('seller')
}

export const clearAll = () => {
  localStorage.clear()
}
