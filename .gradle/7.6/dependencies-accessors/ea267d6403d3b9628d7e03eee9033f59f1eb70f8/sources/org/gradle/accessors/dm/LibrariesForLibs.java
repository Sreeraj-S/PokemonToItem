package org.gradle.accessors.dm;

import org.gradle.api.NonNullApi;
import org.gradle.api.artifacts.MinimalExternalModuleDependency;
import org.gradle.plugin.use.PluginDependency;
import org.gradle.api.artifacts.ExternalModuleDependencyBundle;
import org.gradle.api.artifacts.MutableVersionConstraint;
import org.gradle.api.provider.Provider;
import org.gradle.api.model.ObjectFactory;
import org.gradle.api.provider.ProviderFactory;
import org.gradle.api.internal.catalog.AbstractExternalDependencyFactory;
import org.gradle.api.internal.catalog.DefaultVersionCatalog;
import java.util.Map;
import javax.inject.Inject;

/**
 * A catalog of dependencies accessible via the `libs` extension.
*/
@NonNullApi
public class LibrariesForLibs extends AbstractExternalDependencyFactory {

    private final AbstractExternalDependencyFactory owner = this;
    private final VersionAccessors vaccForVersionAccessors = new VersionAccessors(providers, config);
    private final BundleAccessors baccForBundleAccessors = new BundleAccessors(objects, providers, config);
    private final PluginAccessors paccForPluginAccessors = new PluginAccessors(providers, config);

    @Inject
    public LibrariesForLibs(DefaultVersionCatalog config, ProviderFactory providers, ObjectFactory objects) {
        super(config, providers, objects);
    }

        /**
         * Creates a dependency provider for architectury (dev.architectury:architectury)
         */
        public Provider<MinimalExternalModuleDependency> getArchitectury() { return create("architectury"); }

        /**
         * Creates a dependency provider for architecturyFabric (dev.architectury:architectury-fabric)
         */
        public Provider<MinimalExternalModuleDependency> getArchitecturyFabric() { return create("architecturyFabric"); }

        /**
         * Creates a dependency provider for architecturyForge (dev.architectury:architectury-forge)
         */
        public Provider<MinimalExternalModuleDependency> getArchitecturyForge() { return create("architecturyForge"); }

        /**
         * Creates a dependency provider for architecturyPlugin (architectury-plugin:architectury-plugin.gradle.plugin)
         */
        public Provider<MinimalExternalModuleDependency> getArchitecturyPlugin() { return create("architecturyPlugin"); }

        /**
         * Creates a dependency provider for fabricApi (net.fabricmc.fabric-api:fabric-api)
         */
        public Provider<MinimalExternalModuleDependency> getFabricApi() { return create("fabricApi"); }

        /**
         * Creates a dependency provider for fabricKotlin (net.fabricmc:fabric-language-kotlin)
         */
        public Provider<MinimalExternalModuleDependency> getFabricKotlin() { return create("fabricKotlin"); }

        /**
         * Creates a dependency provider for fabricLoader (net.fabricmc:fabric-loader)
         */
        public Provider<MinimalExternalModuleDependency> getFabricLoader() { return create("fabricLoader"); }

        /**
         * Creates a dependency provider for fabricPermissionsApi (me.lucko:fabric-permissions-api)
         */
        public Provider<MinimalExternalModuleDependency> getFabricPermissionsApi() { return create("fabricPermissionsApi"); }

        /**
         * Creates a dependency provider for forge (net.minecraftforge:forge)
         */
        public Provider<MinimalExternalModuleDependency> getForge() { return create("forge"); }

        /**
         * Creates a dependency provider for jetbrainsAnnotations (org.jetbrains:annotations)
         */
        public Provider<MinimalExternalModuleDependency> getJetbrainsAnnotations() { return create("jetbrainsAnnotations"); }

        /**
         * Creates a dependency provider for junitApi (org.junit.jupiter:junit-jupiter-api)
         */
        public Provider<MinimalExternalModuleDependency> getJunitApi() { return create("junitApi"); }

        /**
         * Creates a dependency provider for junitEngine (org.junit.jupiter:junit-jupiter-engine)
         */
        public Provider<MinimalExternalModuleDependency> getJunitEngine() { return create("junitEngine"); }

        /**
         * Creates a dependency provider for junitParams (org.junit.jupiter:junit-jupiter-params)
         */
        public Provider<MinimalExternalModuleDependency> getJunitParams() { return create("junitParams"); }

        /**
         * Creates a dependency provider for kotlin (org.jetbrains.kotlin:kotlin-gradle-plugin)
         */
        public Provider<MinimalExternalModuleDependency> getKotlin() { return create("kotlin"); }

        /**
         * Creates a dependency provider for kotlinForForge (thedarkcolour:kotlinforforge)
         */
        public Provider<MinimalExternalModuleDependency> getKotlinForForge() { return create("kotlinForForge"); }

        /**
         * Creates a dependency provider for loom (dev.architectury:architectury-loom)
         */
        public Provider<MinimalExternalModuleDependency> getLoom() { return create("loom"); }

        /**
         * Creates a dependency provider for mockito (org.mockito:mockito-core)
         */
        public Provider<MinimalExternalModuleDependency> getMockito() { return create("mockito"); }

        /**
         * Creates a dependency provider for mockk (io.mockk:mockk)
         */
        public Provider<MinimalExternalModuleDependency> getMockk() { return create("mockk"); }

        /**
         * Creates a dependency provider for reflect (org.jetbrains.kotlin:kotlin-reflect)
         */
        public Provider<MinimalExternalModuleDependency> getReflect() { return create("reflect"); }

        /**
         * Creates a dependency provider for serializationCore (org.jetbrains.kotlinx:kotlinx-serialization-core-jvm)
         */
        public Provider<MinimalExternalModuleDependency> getSerializationCore() { return create("serializationCore"); }

        /**
         * Creates a dependency provider for serializationJson (org.jetbrains.kotlinx:kotlinx-serialization-json-jvm)
         */
        public Provider<MinimalExternalModuleDependency> getSerializationJson() { return create("serializationJson"); }

        /**
         * Creates a dependency provider for shadow (gradle.plugin.com.github.johnrengelman:shadow)
         */
        public Provider<MinimalExternalModuleDependency> getShadow() { return create("shadow"); }

        /**
         * Creates a dependency provider for stdlib (org.jetbrains.kotlin:kotlin-stdlib-jdk8)
         */
        public Provider<MinimalExternalModuleDependency> getStdlib() { return create("stdlib"); }

    /**
     * Returns the group of versions at versions
     */
    public VersionAccessors getVersions() { return vaccForVersionAccessors; }

    /**
     * Returns the group of bundles at bundles
     */
    public BundleAccessors getBundles() { return baccForBundleAccessors; }

    /**
     * Returns the group of plugins at plugins
     */
    public PluginAccessors getPlugins() { return paccForPluginAccessors; }

    public static class VersionAccessors extends VersionFactory  {

        private final ArchitecturyVersionAccessors vaccForArchitecturyVersionAccessors = new ArchitecturyVersionAccessors(providers, config);
        private final FabricVersionAccessors vaccForFabricVersionAccessors = new FabricVersionAccessors(providers, config);
        public VersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

            /**
             * Returns the version associated to this alias: annotations (23.0.0)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getAnnotations() { return getVersion("annotations"); }

            /**
             * Returns the version associated to this alias: coroutines (1.6.1)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getCoroutines() { return getVersion("coroutines"); }

            /**
             * Returns the version associated to this alias: forge (1.19.2-43.2.4)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getForge() { return getVersion("forge"); }

            /**
             * Returns the version associated to this alias: junit (5.9.0)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getJunit() { return getVersion("junit"); }

            /**
             * Returns the version associated to this alias: kotlin (1.7.10)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getKotlin() { return getVersion("kotlin"); }

            /**
             * Returns the version associated to this alias: kotlinForForge (3.8.0)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getKotlinForForge() { return getVersion("kotlinForForge"); }

            /**
             * Returns the version associated to this alias: loom (0.12.0-SNAPSHOT)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getLoom() { return getVersion("loom"); }

            /**
             * Returns the version associated to this alias: mockito (3.3.3)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getMockito() { return getVersion("mockito"); }

            /**
             * Returns the version associated to this alias: mockk (1.12.1)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getMockk() { return getVersion("mockk"); }

            /**
             * Returns the version associated to this alias: serialization (1.3.2)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getSerialization() { return getVersion("serialization"); }

            /**
             * Returns the version associated to this alias: shadow (7.1.2)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getShadow() { return getVersion("shadow"); }

        /**
         * Returns the group of versions at versions.architectury
         */
        public ArchitecturyVersionAccessors getArchitectury() { return vaccForArchitecturyVersionAccessors; }

        /**
         * Returns the group of versions at versions.fabric
         */
        public FabricVersionAccessors getFabric() { return vaccForFabricVersionAccessors; }

    }

    public static class ArchitecturyVersionAccessors extends VersionFactory  implements VersionNotationSupplier {

        public ArchitecturyVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

        /**
         * Returns the version associated to this alias: architectury (6.5.69)
         * If the version is a rich version and that its not expressible as a
         * single version string, then an empty string is returned.
         */
        public Provider<String> asProvider() { return getVersion("architectury"); }

            /**
             * Returns the version associated to this alias: architectury.plugin (3.4-SNAPSHOT)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getPlugin() { return getVersion("architectury.plugin"); }

    }

    public static class FabricVersionAccessors extends VersionFactory  {

        private final FabricPermissionsVersionAccessors vaccForFabricPermissionsVersionAccessors = new FabricPermissionsVersionAccessors(providers, config);
        public FabricVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

            /**
             * Returns the version associated to this alias: fabric.api (0.75.1+1.19.2)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getApi() { return getVersion("fabric.api"); }

            /**
             * Returns the version associated to this alias: fabric.kotlin (1.8.2+kotlin.1.7.10)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getKotlin() { return getVersion("fabric.kotlin"); }

            /**
             * Returns the version associated to this alias: fabric.loader (0.14.9)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getLoader() { return getVersion("fabric.loader"); }

        /**
         * Returns the group of versions at versions.fabric.permissions
         */
        public FabricPermissionsVersionAccessors getPermissions() { return vaccForFabricPermissionsVersionAccessors; }

    }

    public static class FabricPermissionsVersionAccessors extends VersionFactory  {

        public FabricPermissionsVersionAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

            /**
             * Returns the version associated to this alias: fabric.permissions.api (0.2-SNAPSHOT)
             * If the version is a rich version and that its not expressible as a
             * single version string, then an empty string is returned.
             */
            public Provider<String> getApi() { return getVersion("fabric.permissions.api"); }

    }

    public static class BundleAccessors extends BundleFactory {

        public BundleAccessors(ObjectFactory objects, ProviderFactory providers, DefaultVersionCatalog config) { super(objects, providers, config); }

    }

    public static class PluginAccessors extends PluginFactory {

        public PluginAccessors(ProviderFactory providers, DefaultVersionCatalog config) { super(providers, config); }

    }

}
