package me.sreeraj.pokemontoitem.commands;

import com.cobblemon.mod.common.Cobblemon;
import com.cobblemon.mod.common.api.storage.party.PlayerPartyStore;
import com.cobblemon.mod.common.pokemon.Pokemon;
import com.mojang.brigadier.CommandDispatcher;
import com.mojang.brigadier.context.CommandContext;
import me.sreeraj.pokemontoitem.PokemonToItem;
import me.sreeraj.pokemontoitem.permissions.PokemonToItemPermissions;
import net.minecraft.item.ItemStack;
import net.minecraft.nbt.NbtCompound;
import net.minecraft.server.command.ServerCommandSource;
import net.minecraft.server.network.ServerPlayerEntity;
import net.minecraft.text.Text;
import net.minecraft.util.Hand;

import static net.minecraft.server.command.CommandManager.literal;

public class ItemToPoke {


    public void register(CommandDispatcher<ServerCommandSource> dispatcher) {
        dispatcher.register(
                literal("itemtopoke")
                        .requires(src -> PokemonToItemPermissions.checkPermission(src, PokemonToItem.permissions.ITEMTOPOKE_PERMISSION))
                        .executes(this::self)
        );
    }

    private int self(CommandContext<ServerCommandSource> ctx) {
        if (ctx.getSource().getPlayer() != null) {
            ServerPlayerEntity player = ctx.getSource().getPlayer();
            ItemStack pokemonStack = player.getMainHandStack();
            if (pokemonStack != null && pokemonStack.hasNbt() && pokemonStack.getSubNbt("PokemonData") != null) {
                Pokemon pokemon = new Pokemon();
                PlayerPartyStore party = Cobblemon.INSTANCE.getStorage().getParty(player);
                NbtCompound pokemonNbt = pokemonStack.getSubNbt("PokemonData");
                if (pokemonNbt != null) {
                    NbtCompound pokemonData = pokemonNbt.getCompound("Data");
                    pokemon.loadFromNBT(pokemonData);
                    party.add(pokemon);
                    player.setStackInHand(Hand.MAIN_HAND, ItemStack.EMPTY);
                }
            } else {
                player.sendMessage(Text.of("[§2§lPokeToItem§f] §4§lYou don't have a Pokémon in your main hand!!!"));
                player.sendMessage(Text.of("[§2§lPokeToItem§f] Please place a Pokémon in your main hand and try again!"));
            }
        }
        return 1;
    }
}
