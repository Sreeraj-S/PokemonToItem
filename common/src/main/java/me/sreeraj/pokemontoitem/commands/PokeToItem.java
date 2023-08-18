package me.sreeraj.pokemontoitem.commands;

import com.cobblemon.mod.common.Cobblemon;
import com.cobblemon.mod.common.api.storage.party.PlayerPartyStore;
import com.cobblemon.mod.common.pokemon.Pokemon;
import com.cobblemon.mod.common.pokemon.evolution.variants.TradeEvolution;
import com.mojang.brigadier.CommandDispatcher;
import com.mojang.brigadier.context.CommandContext;
import me.sreeraj.pokemontoitem.PokemonToItem;
import me.sreeraj.pokemontoitem.permissions.PokemonToItemPermissions;
import me.sreeraj.pokemontoitem.screen.PokeToItemHandlerFactory;
import net.minecraft.server.command.ServerCommandSource;
import net.minecraft.server.network.ServerPlayerEntity;


import java.util.HashMap;
import java.util.UUID;

import static net.minecraft.server.command.CommandManager.literal;

public class PokeToItem {
    public void register(CommandDispatcher<ServerCommandSource> dispatcher) {
        dispatcher.register(
                literal("poketoitem")
                        .requires(src -> PokemonToItemPermissions.checkPermission(src, PokemonToItem.permissions.POKETOITEM_PERMISSION))
                        .executes(this::self)
        );
    }
    public HashMap<UUID, PokeToItem.Session> sessions = new HashMap<>();

    public class Session {
        public ServerPlayerEntity sPlayer;
        UUID uuid; // In case of offline.
        public Pokemon pokemon;
        long timestamp;

        public Session(ServerPlayerEntity player) {
            this.sPlayer = player;
            this.uuid = player.getUuid();
            this.timestamp = System.currentTimeMillis();
        }


        public void removePokemon(Pokemon playerPokemon) {
            PlayerPartyStore party = Cobblemon.INSTANCE.getStorage().getParty(this.sPlayer);
            if (playerPokemon != null) {
                party.remove(playerPokemon);
            }
        }

        public void acceptPokemon(ServerPlayerEntity player, Pokemon playerPokemon) {
            PlayerPartyStore party = Cobblemon.INSTANCE.getStorage().getParty(player);
            if (playerPokemon != null) {
                party.add(playerPokemon);
            }
        }
    }

    private int self(CommandContext<ServerCommandSource> ctx) {
        if (ctx.getSource().getPlayer() != null) {
            ServerPlayerEntity player = ctx.getSource().getPlayer();
            Session session = new Session(player);
            sessions.put(player.getUuid(), session);
            player.openHandledScreen(new PokeToItemHandlerFactory(session));
        }
        return 1;
    }
}
