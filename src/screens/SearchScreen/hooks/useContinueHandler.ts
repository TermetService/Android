import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { ApiService } from '../../../services/api';

export const useContinueHandler = () => {
    const handleContinue = async () => {
        try {
            Alert.alert(
                'Продолжение работы',
                'Вы уверены, что хотите продолжить работу?',
                [
                    {
                        text: 'Отмена',
                        style: 'cancel',
                    },
                    {
                        text: 'Продолжить',
                        onPress: async () => {
                            const result = await ApiService.continueWork();

                            if (result.success) {
                                Toast.show({
                                    type: 'success',
                                    text1: result.message || 'Успешно!',
                                    position: 'top',
                                    visibilityTime: 3000,
                                    autoHide: true,
                                    props: {
                                        zIndex: 9999, // или любое большое число
                                    }
                                });
                            } else {
                                Toast.show({
                                    type: 'error',
                                    text1: result.message || 'Ошибка',
                                    position: 'top',
                                    visibilityTime: 4000,
                                    autoHide: true,
                                    props: {
                                        zIndex: 9999, // или любое большое число
                                    }
                                });
                            }
                        },
                    },
                ]
            );

        } catch (error: any) {
            console.error('Ошибка в handleContinue:', error);
            Toast.show({
                type: 'error',
                text1: error.message || 'Произошла ошибка',
                position: 'top',
                visibilityTime: 4000,
                autoHide: true,
            });
        }
    };

    return {
        handleContinue,
    };
};