package me.sreeraj.pokemontoitem.permissions;

import com.cobblemon.mod.common.Cobblemon;
import com.cobblemon.mod.common.api.permission.CobblemonPermission;
import com.cobblemon.mod.common.api.permission.PermissionLevel;
import me.sreeraj.pokemontoitem.config.PokemonToItemConfig;
import net.minecraft.command.CommandSource;

public class PokemonToItemPermissions {

    public final CobblemonPermission POKETOITEM_PERMISSION;
    public final CobblemonPermission ITEMTOPOKE_PERMISSION;


    public PokemonToItemPermissions() {
        this.POKETOITEM_PERMISSION = new CobblemonPermission("pokemontoitem.command.poketoitem", toPermLevel(PokemonToItemConfig.COMMAND_POKETOITEM_PERMISSION_LEVEL));
        this.ITEMTOPOKE_PERMISSION = new CobblemonPermission("pokemontoitem.command.poketoitem", toPermLevel(PokemonToItemConfig.COMMAND_ITEMTOPOKE_PERMISSION_LEVEL));
        }

    public PermissionLevel toPermLevel(int permLevel) {
        for (PermissionLevel value : PermissionLevel.values()) {
            if (value.ordinal() == permLevel) {
                return value;
            }
        }
        return PermissionLevel.CHEAT_COMMANDS_AND_COMMAND_BLOCKS;
    }

    public static boolean checkPermission(CommandSource source, CobblemonPermission permission) {
        return Cobblemon.INSTANCE.getPermissionValidator().hasPermission(source, permission);
    }
}
