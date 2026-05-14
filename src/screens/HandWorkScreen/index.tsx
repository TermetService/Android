// src/screens/HandWorkScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { styles } from './styles';
import { ManualWorkModal } from './Modal/ManualWorkModal';

export const HandWorkScreen = () => {
  const [showManualModal, setShowManualModal] = useState(false);

  const startHandWork = async () => {
    setShowManualModal(true);
  };

  const stopHandWork = async () => {
    setShowManualModal(false);
  };

  useEffect(() => {
    startHandWork();
  }, []);

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Ручная работа</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.centerContainer}>
            {/* Кнопка "Начать ручную работу" */}
            <TouchableOpacity
              style={styles.startButton}
              onPress={startHandWork} // Прямой вызов без подтверждения
              activeOpacity={0.7}
            >
              <Text style={styles.startButtonText}>Начать ручную работу</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Модальное окно "Режим ручной работы" */}
      <ManualWorkModal visible={showManualModal} onClose={stopHandWork} />
    </>
  );
};

// // Компонент модального окна ручной работы
// interface ManualWorkModalProps {
//   visible: boolean;
//   onClose: () => void;
// }

// const ManualWorkModal: React.FC<ManualWorkModalProps> = ({ visible, onClose }) => {
//   const [code, setCode] = useState('');
//   const [showCustomAlert, setShowCustomAlert] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: '',
//     message: '',
//     type: 'success' as 'success' | 'error',
//   });

//   const inputRef = useRef<TextInput>(null);

//   // Автофокус при открытии модального окна
//   useEffect(() => {
//     if (visible) {
//       const timer = setTimeout(() => {
//         inputRef.current?.focus();
//       }, 300);
//       return () => clearTimeout(timer);
//     }
//   }, [visible]);

//   const resetInput = () => {
//     // Очищаем поле ввода после алерта
//     setCode('');
//     // Возвращаем фокус на поле ввода
//     setTimeout(() => inputRef.current?.focus(), 100);
//   };

//   // Обработка отправки кода
//   const handleSubmit = async () => {
//     const trimmedCode = code.trim();
//     if (!trimmedCode) return;

//     try {
//       const result = await ApiService.handSave(trimmedCode);
//       console.log(`Ручное сохранение кода: ----============= ${JSON.stringify(result)}`);

//       // Настраиваем кастомный алерт в зависимости от результата
//       if (result.success) {
//         setAlertConfig({
//           title: '✅ Успешно',
//           message: result.message, // теперь здесь будет информативное сообщение
//           type: 'success',
//         });
//       } else {
//         setAlertConfig({
//           title: '⚠️ Ошибка',
//           message: result.message,
//           type: 'error',
//         });
//       }

//       setShowCustomAlert(true);

//     } catch (error) {
//       setAlertConfig({
//         title: '❌ Ошибка',
//         message: 'Произошла ошибка при сохранении кода',
//         type: 'error',
//       });
//       setShowCustomAlert(true);
//     }
//   };

//   // Обработка нажатия Enter
//   const handleKeyPress = (event: any) => {
//     if (event.nativeEvent.key === 'Enter') {
//       handleSubmit();
//     }
//   };

//   // Обработчик закрытия кастомного алерта
//   const handleAlertClose = () => {
//     setShowCustomAlert(false);
//     resetInput();
//   };

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={false}
//       onRequestClose={onClose}
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.modalContainer}
//       >
//         {/* Заголовок модального окна */}
//         <View style={styles.modalHeader}>
//           <Text style={styles.modalTitle}>Режим ручной работы</Text>
//           <TouchableOpacity onPress={onClose} style={styles.closeButton}>
//             <Text style={styles.closeButtonText}>✕</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Основное содержимое - поле ввода по центру */}
//         <View style={styles.modalContent}>
//           <TextInput
//             ref={inputRef}
//             style={styles.manualWorkInput}
//             value={code}
//             onChangeText={setCode}
//             onSubmitEditing={handleSubmit}
//             onKeyPress={handleKeyPress}
//             placeholder="Введите код"
//             placeholderTextColor="#999"
//             autoCapitalize="characters"
//             autoCorrect={false}
//             autoFocus={true}
//             returnKeyType="done"
//             blurOnSubmit={false}
//           />

//           <Text style={styles.inputHint}>
//             Введите код и нажмите Enter для отправки
//           </Text>
//         </View>

//         {/* Кастомный алерт */}
//         <CustomAlert
//           visible={showCustomAlert}
//           title={alertConfig.title}
//           message={alertConfig.message}
//           type={alertConfig.type}
//           onClose={handleAlertClose}
//           autoCloseTime={alertConfig.type === 'success' ? 1000 : undefined}
//         />
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// };