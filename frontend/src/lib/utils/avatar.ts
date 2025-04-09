/**
 * Generates a consistent avatar URL using DiceBear's API
 * @param seed - The seed to use for generating the avatar (e.g., user's name)
 * @param style - The style of avatar to generate (defaults to 'initials')
 * @param size - The size of the avatar in pixels (defaults to 80)
 * @returns The URL for the generated avatar
 */
export function generateAvatarUrl(
  seed: string,
  style: string = "initials",
  size: number = 80
): string {
  const baseUrl = "https://api.dicebear.com/7.x";
  const backgroundColor = "b6e3f4,c0aede,d1f4d9,ffdfbf,ffd5dc";

  return `${baseUrl}/${style}/svg?seed=${encodeURIComponent(
    seed
  )}&size=${size}&backgroundColor=${backgroundColor}`;
}
