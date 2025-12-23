export interface Skin {
    id: string;
    name: string;
    price: number;
    // color: string; // Removed color property as we are focusing on Sprites, not glows. 
    // We can keep it if needed for UI accents, but user explicitly said "not the halo".
    // Keeping it for UI consistency (rarity color?) but will ignore for rendering.
    color: string;
}

export const SKINS: Skin[] = [
    { id: 'classic', name: 'Classic', price: 0, color: '#FFFFFF' },
    // Other skins removed as per request to make them "Coming Soon"
];
