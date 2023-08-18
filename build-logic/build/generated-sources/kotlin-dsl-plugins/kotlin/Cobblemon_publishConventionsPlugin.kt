/**
 * Precompiled [cobblemon.publish-conventions.gradle.kts][Cobblemon_publish_conventions_gradle] script plugin.
 *
 * @see Cobblemon_publish_conventions_gradle
 */
public
class Cobblemon_publishConventionsPlugin : org.gradle.api.Plugin<org.gradle.api.Project> {
    override fun apply(target: org.gradle.api.Project) {
        try {
            Class
                .forName("Cobblemon_publish_conventions_gradle")
                .getDeclaredConstructor(org.gradle.api.Project::class.java, org.gradle.api.Project::class.java)
                .newInstance(target, target)
        } catch (e: java.lang.reflect.InvocationTargetException) {
            throw e.targetException
        }
    }
}
