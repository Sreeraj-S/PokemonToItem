package me.sreeraj.pokemontoitem.fabric

import me.sreeraj.pokemontoitem.PokemonToItem
import net.fabricmc.api.ModInitializer

class PokemonToItemFabric : ModInitializer {
    override fun onInitialize() {
        PokemonToItem.initialize();

    }
}