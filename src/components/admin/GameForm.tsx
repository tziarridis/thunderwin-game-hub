
// When formatting game data for submission, ensure all required properties are included
const gameData = {
  ...(initialValues?.id ? { id: initialValues.id } : {}),
  title: formData.title,
  image: formData.image,
  provider: formData.provider,
  category: formData.category as Game['category'],
  tags: initialValues?.tags || [],
  isPopular: formData.isPopular,
  isNew: formData.isNew,
  rtp: parseFloat(formData.rtp),
  minBet: parseFloat(formData.minBet),
  maxBet: parseFloat(formData.maxBet),
  volatility: formData.volatility as Game['volatility'],
  jackpot: initialValues?.jackpot || false,
  releaseDate: formData.releaseDate,
  description: formData.description
};
