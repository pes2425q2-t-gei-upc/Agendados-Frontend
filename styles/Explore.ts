import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  applyButton: {
    alignItems: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    paddingVertical: 15,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    marginRight: 10,
    paddingVertical: 15,
  },
  clearButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  clearFilterChip: {
    alignItems: 'center',
    backgroundColor: '#f44336',
    borderRadius: 20,
    elevation: 2,
    flexDirection: 'row',
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  clearFilterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  container: {
    flex: 1,
  },
  datePickerButton: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  datePickerButtonText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    bottom: 0,
    padding: 20,
    position: 'absolute',
    width: '100%',
  },
  datePickerHeader: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
  },
  datePickerModal: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  datePickerTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateRangeChip: {
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    borderColor: '#4285F4',
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  dateRangeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  dateRangeSeparator: {
    color: '#666',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 220,
  },
  eventCardContent: {
    padding: 12,
  },
  eventCardDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  eventCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventCardTime: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  eventCardTimeText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  eventCardTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventDescription: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
  },
  eventImage: {
    height: 100,
    width: '100%',
  },
  eventTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventsButton: {
    alignSelf: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 25,
    bottom: 20,
    elevation: 4,
    paddingHorizontal: 20,
    paddingVertical: 10,
    position: 'absolute',
  },
  eventsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventsModalContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  eventsModalContent: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'flex-end',
    maxHeight: '85%',
    padding: 20,
  },
  eventsModalHeader: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
  },
  eventsModalTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterActionsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: 30,
  },
  filterButton: {
    padding: 8,
  },
  filterButtonActive: {
    backgroundColor: '#4285F4',
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 2,
    flexDirection: 'row',
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  filterGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterGridItem: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    width: '23%',
  },
  filterGridText: {
    color: '#666',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  filterTextActive: {
    color: '#fff',
  },
  filtersScrollContainer: {
    paddingVertical: 5,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
  },
  modalTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  myLocationButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 28,
    elevation: 4,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    top: 115,
    width: 56,
    zIndex: 1,
  },
  nearbyEventsContainer: {
    bottom: 60,
    left: 0,
    paddingHorizontal: 20,
    position: 'absolute',
    right: 0,
  },
  nearbyEventsScrollContainer: {
    paddingBottom: 10,
  },
  // eslint-disable-next-line react-native/sort-styles
  dropdownOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  populationDropdownButton: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 12,
  },
  populationDropdownButtonText: {
    color: '#333',
    fontSize: 16,
  },
  populationDropdownContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%', // ahora ocupa el 80% de la pantalla
    padding: 20,
  },
  populationDropdownHeader: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
  },
  populationDropdownTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  populationList: {
    maxHeight: 400,
  },
  populationListItem: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  populationListItemSelected: {
    backgroundColor: '#4285F4',
  },
  populationListItemText: {
    color: '#333',
    fontSize: 16,
  },
  populationListItemTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  removeFilterIcon: {
    marginLeft: 5,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 28,
    flexDirection: 'row',
    marginTop: -10,
    paddingHorizontal: 10,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: '100%',
  },
  searchContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'absolute',
    top: 30,
    width: '100%',
    zIndex: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 40,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 5,
  },
  // Estilos para el selector de fechas simplificado
  simpleDatePickerContainer: {
    marginVertical: 10,
  },
  dateOptionsList: {
    maxHeight: 350,
  },
  dateOption: {
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  dateOptionText: {
    color: '#333',
    fontSize: 16,
  },
  dateOptionSeparator: {
    backgroundColor: '#f5f5f5',
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  eventModalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    marginBottom: 10, // Space between cards in the modal
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 220,
  },
  searchPopulationContainer: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchPopulationIcon: {
    marginRight: 8,
  },
  searchPopulationInput: {
    color: '#333',
    flex: 1,
    fontSize: 16,
  },
  clearSearchButton: {
    padding: 4,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    color: '#666',
    fontSize: 16,
  },
  /* eslint-enable sort-keys */
});
