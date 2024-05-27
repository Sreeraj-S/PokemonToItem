package me.sreeraj.pokemontoitem.config;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import com.google.gson.stream.JsonWriter;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.lang.reflect.Type;
import java.util.HashMap;

public class PokemonToItemConfig {
    Gson GSON = new GsonBuilder()
            .disableHtmlEscaping()
            .setPrettyPrinting()
            .create();

    public static int COMMAND_POKETOITEM_PERMISSION_LEVEL = 2;
    public static int COMMAND_ITEMTOPOKE_PERMISSION_LEVEL = 2;

    public PokemonToItemConfig() {
        init();
    }

    public void init() {
        File configFolder = new File(System.getProperty("user.dir") + "/config/pokemontoitem");
        File configFile = new File(configFolder, "config.json");
        System.out.println("PokemonToItem config -> " + configFolder.getAbsolutePath());
        if (!configFolder.exists()) {
            configFolder.mkdirs();
            createConfig(configFolder);
        } else if (!configFile.exists()) {
            createConfig(configFolder);
        }

        try {
            Type type = new TypeToken<HashMap<String, Integer>>(){}.getType();
            JsonObject obj = GSON.fromJson(new FileReader(configFile), JsonObject.class);
            JsonObject permLevels = obj.get("permissionlevels").getAsJsonObject();
            HashMap<String, Integer> permissionMap = GSON.fromJson(permLevels, type);


            COMMAND_ITEMTOPOKE_PERMISSION_LEVEL = permissionMap.getOrDefault("command.itemtopoke", 2);
            COMMAND_POKETOITEM_PERMISSION_LEVEL = permissionMap.getOrDefault("command.poketoitem", 2);


        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private void createConfig(File configFolder) {
        File file = new File(configFolder, "config.json");
        try {
            file.createNewFile();
            JsonWriter writer = GSON.newJsonWriter(new FileWriter(file));
            writer.beginObject()
                    .name("permissionlevels")
                    .beginObject()
                        .name("command.poketoitem")
                        .value(2)
                        .name("command.itemtopoke")
                        .value(2)
                    .endObject()
                .endObject()
                .flush();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
