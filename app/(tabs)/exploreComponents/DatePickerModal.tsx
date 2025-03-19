import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Modal, TouchableOpacity, View, Text } from 'react-native';

import { styles } from '../../../styles/Explore';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  currentMode: 'start' | 'end';
  datePickerDate: Date;
  onDateChange: (event: any, date?: Date) => void;
  onConfirm: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  currentMode,
  datePickerDate,
  onDateChange,
  onConfirm,
}) => {
  return (
    <Modal
      transparent
      animationType='slide'
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.datePickerModal}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <Text style={styles.datePickerTitle}>
              {currentMode === 'start'
                ? 'Seleccionar data inici'
                : 'Seleccionar data fi'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name='close' size={24} color='#333' />
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={datePickerDate}
            mode='date'
            display='spinner'
            onChange={onDateChange}
          />
          <View style={styles.filterActionsContainer}>
            <TouchableOpacity style={styles.clearButton} onPress={onClose}>
              <Text style={styles.clearButtonText}>Cancel·lar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onConfirm}>
              <Text style={styles.applyButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
