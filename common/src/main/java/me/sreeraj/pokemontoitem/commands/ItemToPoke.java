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
import net.minecraft.nbt.NbtIo;
import net.minecraft.server.command.ServerCommandSource;
import net.minecraft.server.network.ServerPlayerEntity;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.File;
import java.io.IOException;


import static net.minecraft.server.command.CommandManager.literal;

public class ItemToPoke {
    private static final Logger LOGGER = LogManager.getLogger();
    public void register(CommandDispatcher<ServerCommandSource> dispatcher) {
        dispatcher.register(
                literal("itemtopoke")
                        .requires(src -> PokemonToItemPermissions.checkPermission(src, PokemonToItem.permissions.ITEMTOPOKE_PERMISSION))
                        .executes(this::self)
        );
    }

        private int self (CommandContext<ServerCommandSource> ctx) {
            if (ctx.getSource().getPlayer() != null) {
                ServerPlayerEntity player = ctx.getSource().getPlayer();
                ItemStack pokemonStack = player.getMainHandStack();
                if (pokemonStack != null && pokemonStack.hasNbt() && pokemonStack.getSubNbt("pokemonUUID") != null) {
                    Pokemon pokemon = new Pokemon();
                    PlayerPartyStore party = Cobblemon.INSTANCE.getStorage().getParty(player);
                    NbtCompound pokemonNBT= pokemonStack.getSubNbt("pokemonUUID");
                    String pokemonUUID = pokemonNBT.getString("pokemonUUID");
                    String filePath = System.getProperty("user.dir") + "/config/pokemontoitem/nbt/"+pokemonUUID+".nbt";
                    File nbtFile = new File(filePath);
                    try {
                        NbtCompound nbt = NbtIo.readCompressed(nbtFile);
                        LOGGER.info(nbt);
                        pokemon.loadFromNBT(nbt);
                        if (pokemon != null) {
                            party.add(pokemon);
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }

                    for(int i = 0;i<9;i++) {
                        ItemStack stack = player.getInventory().getStack(i);
                        if (stack != null && stack.hasNbt() && stack.getSubNbt("pokemonUUID") != null) {
                            if(stack.getSubNbt("pokemonUUID").getString("pokemonUUID") == pokemonUUID){
                                player.getInventory().setStack(i, ItemStack.EMPTY);
                            }
                        }
                    }
                }
            }
            return 1;
        }
}
