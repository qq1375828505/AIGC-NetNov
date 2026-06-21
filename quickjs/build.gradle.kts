import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.ai.assistance.quickjs"
    compileSdk = 36

    defaultConfig {
        minSdk = 26

        // Temporarily disabled: CMake native build disabled (see top-level externalNativeBuild).
        // externalNativeBuild {
        //     cmake {
        //         cppFlags("-std=c++17")
        //     }
        // }

        ndk {
            abiFilters.addAll(listOf("arm64-v8a"))
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
        debug {
            isMinifyEnabled = false
        }
    }

    // Temporarily disabled: CMake native build requires submodules that are not yet
    // registered in the repository index. Re-enable once submodules are properly added.
    // externalNativeBuild {
    //     cmake {
    //         path = file("src/main/cpp/CMakeLists.txt")
    //     }
    // }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

}

kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.JVM_17
    }
}

dependencies {
    implementation(libs.kotlinx.serialization)
}
