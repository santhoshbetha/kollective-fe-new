// src/components/locales.js

export const APP_LOCALES = {
    'en-US': {
        label: 'English (US)',
        translations: {
            settings_title: 'System Settings',
            pref_heading: 'App Preferences',
            pref_desc: 'Configure theme constraints and local interface telemetry variables.',
            lang_label: 'Interface Language',
            theme_label: 'Visual Application Theme',
            theme_dark: 'Deep Charcoal (Dark)',
            theme_light: 'Alabaster Crisp (Light)',
            btn_save: 'Commit Preferences',
            broadcast_placeholder: "What's breaking across your local grid node?",
            nav_back: 'Back'
        }
    },
    'es-ES': {
        label: 'Español (España)',
        translations: {
            settings_title: 'Ajustes del Sistema',
            pref_heading: 'Preferencias de la Aplicación',
            pref_desc: 'Configure las restricciones del tema y las variables de telemetría de la interfaz local.',
            lang_label: 'Idioma de la Interfaz',
            theme_label: 'Tema Visual de la Aplicación',
            theme_dark: 'Carbono Profundo (Oscuro)',
            theme_light: 'Alabaster Claro (Claro)',
            btn_save: 'Confirmar Preferencias',
            broadcast_placeholder: '¿Qué se está rompiendo en las coordenadas de tu nodo de red local?',
            nav_back: 'Volver'
        }
    },
    'fr-FR': {
        label: 'Français (France)',
        translations: {
            settings_title: 'Paramètres Système',
            pref_heading: 'Préférences de l\'Application',
            pref_desc: 'Configurez les contraintes de thème et les variables de télémétrie de l\'interface locale.',
            lang_label: 'Langue de l\'Interface',
            theme_label: 'Thème Visuel de l\'Application',
            theme_dark: 'Charbon Profond (Sombre)',
            theme_light: 'Alabaster Clair (Clair)',
            btn_save: 'Valider les Préférences',
            broadcast_placeholder: 'Qu\'est-ce qui rompt dans les coordonnées de votre nœud de réseau local ?',
            nav_back: 'Retour'
        }
    }
};

/**
 * 🗺️ Shared Translational Interpreter Utility Hook
 * Connects your Zustand active language straight to your dictionary text strings.
 */
export function useTranslation(currentLang) {
    const dictionary = APP_LOCALES[currentLang]?.translations || APP_LOCALES['en-US'].translations;
    return (key) => dictionary[key] || key;
}
