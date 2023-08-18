package me.sreeraj.pokemontoitem

import com.mojang.brigadier.CommandDispatcher
import dev.architectury.event.events.common.CommandRegistrationEvent
import me.sreeraj.pokemontoitem.commands.*
import me.sreeraj.pokemontoitem.config.PokemonToItemConfig
import me.sreeraj.pokemontoitem.permissions.PokemonToItemPermissions
import net.minecraft.command.CommandRegistryAccess
import net.minecraft.server.command.CommandManager
import net.minecraft.server.command.ServerCommandSource

object PokemonToItem {
    public lateinit var permissions: PokemonToItemPermissions
    const val MODID = "pokemontoitem"
    fun initialize() {
        System.out.println("PokemonToItem - Initialized")
        PokemonToItemConfig() // must load before permissions so perms use default permission level.
        this.permissions = PokemonToItemPermissions()

        CommandRegistrationEvent.EVENT.register(PokemonToItem::registerCommands)
    }

    fun registerCommands(
        dispatcher: CommandDispatcher<ServerCommandSource>,
        registry: CommandRegistryAccess,
        selection: CommandManager.RegistrationEnvironment
    ) {

        PokeToItem().register(dispatcher)
        ItemToPoke().register(dispatcher)
    }

}
