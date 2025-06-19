import { images } from '@/constants/images'
import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { ImageBackground, Text, View } from 'react-native'



const TabIcon = ({ focused, title, icon }: { focused: boolean, title: string, icon: keyof typeof Ionicons.glyphMap }) => {
    if (focused) {
        return (
            <ImageBackground source={images.highlight} className='flex flex-row w-full flex-1 min-w-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden' >
                <Ionicons name={icon} size={20} color="#151312" />
                <Text className='text-secondary text-base font-semibold ml-2'>{title}</Text>
            </ImageBackground>
        )
    }

    return (
        <View className='size-full justify-center items-center mt-4 rounded-full' >
            <Ionicons name={icon} size={20} color="#A8B5DB" />
        </View>
    )
}

const _layout = () => {
    return (        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center'
                },
                tabBarStyle : {
                    backgroundColor: '#0F0D23',
                    borderRadius: 50,
                    marginHorizontal: 20,
                    marginBottom: 30,
                    height: 52,
                    position: 'absolute',
                    overflow: 'hidden',
                    borderColor: '#0F0D23'
                },
                animation: 'none',
               sceneStyle: {
                   backgroundColor: '#030014'
               },
               headerStyle: {
                   backgroundColor: '#030014'
               }
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            title='Home'
                            icon='home'
                        />
                    )
                }}
            />
            <Tabs.Screen
                name='search'
                options={{
                    title: 'Search',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            title='Search'
                            icon='search'
                        />
                    )
                }}
            />
            <Tabs.Screen
                name='saved'
                options={{
                    title: 'Saved',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            title='Saved'
                            icon='bookmark'
                        />
                    )
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            title='Profile'
                            icon='person'
                        />
                    )
                }}
            />
        </Tabs>
    )
}

export default _layout