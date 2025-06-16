import { icons } from '@/constants/icons'
import { images } from '@/constants/images'
import { Tabs } from 'expo-router'
import { useEffect } from 'react'
import { Image, ImageBackground, Text } from 'react-native'
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'



const TabIcon = ({ focused, title, icon }: { focused: boolean, title: string, icon: any }) => {
    const animatedValue = useSharedValue(focused ? 1 : 0) 

        useEffect(() => {
            animatedValue.value = withTiming(focused ? 1 : 0, {
                duration: 300
            })
        }, [focused])

        const animatedStyle = useAnimatedStyle(() => {
            const scale = interpolate(animatedValue.value, [0, 1], [0.8, 1])
            const opacity = interpolate(animatedValue.value, [0, 1], [0.5, 1])
            return {
                transform: [{ scale }],
                opacity
            }
        })
    

    if (focused) {

        return (
            <Animated.View style={animatedStyle} >

            <ImageBackground source={images.highlight} className='flex flex-row w-full flex-1 min-w-[112px] min-h-16 mt-4 justify-center items-center rounded-full overflow-hidden' >
                <Image source={icon} tintColor="#151312" className='size-5' />
                <Text className='text-secondary text-base font-semibold ml-2'>{title}</Text>
            </ImageBackground>
            </Animated.View>

        )
    }

    return (
        <Animated.View style={animatedStyle} className='size-full justify-center items-center mt-4 rounded-full' >

            <Image source={icon} className='size-5' tintColor="#A8B5DB" />
        </Animated.View>




    )
}

const _layout = () => {
    return (
        <Tabs
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
                    marginBottom: 36,
                    height: 52,
                    position: 'absolute',
                    overflow: 'hidden',
                    borderColor: '#0F0D23'
                },
                animation: 'shift'    

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
                            icon={icons.home}
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
                            icon={icons.search}
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
                            icon={icons.save}
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
                            icon={icons.person}
                        />
                    )
                }}
            />
        </Tabs>
    )
}

export default _layout