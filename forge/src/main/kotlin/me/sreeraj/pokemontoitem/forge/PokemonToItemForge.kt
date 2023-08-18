package me.sreeraj.pokemontoitem.forge

import dev.architectury.platform.forge.EventBuses
import me.sreeraj.pokemontoitem.PokemonToItem
import java.util.*
import net.minecraftforge.fml.common.Mod
import net.minecraftforge.fml.event.lifecycle.FMLCommonSetupEvent
import net.minecraftforge.fml.event.lifecycle.FMLDedicatedServerSetupEvent

@Mod(PokemonToItem.MODID)
class PokemonToItemForge {
    init {
        with(thedarkcolour.kotlinforforge.forge.MOD_BUS) {
            EventBuses.registerModEventBus(PokemonToItem.MODID, this)
            addListener(this@PokemonToItemForge::initialize)
            addListener(this@PokemonToItemForge::serverInit)
        }
    }

    fun serverInit(event: FMLDedicatedServerSetupEvent) {
    }

    fun initialize(event: FMLCommonSetupEvent) {
        PokemonToItem.initialize()
        System.out.println("Cobblemon Forge Init.")
    }

}