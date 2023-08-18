/**
 * Precompiled [cobblemon.base-conventions.gradle.kts][Cobblemon_base_conventions_gradle] script plugin.
 *
 * @see Cobblemon_base_conventions_gradle
 */
public
class Cobblemon_baseConventionsPlugin : org.gradle.api.Plugin<org.gradle.api.Project> {
    override fun apply(target: org.gradle.api.Project) {
        try {
            Class
                .forName("Cobblemon_base_conventions_gradle")
                .getDeclaredConstructor(org.gradle.api.Project::class.java, org.gradle.api.Project::class.java)
                .newInstance(target, target)
        } catch (e: java.lang.reflect.InvocationTargetException) {
            throw e.targetException
        }
    }
}
