// LocationService.ts
export type PopulationItem = { id: string; label: string };

export const getTowns = async (): Promise<PopulationItem[]> => {
  try {
    const response = await fetch('http://localhost:8000/api/locations/towns');
    if (!response.ok) {
      throw new Error('Error al obtener las poblaciones');
    }
    const data = await response.json();
    // Suponiendo que data es un array de objetos { id: string, name: string }
    return data.map((town: any) => ({
      id: town.id,
      label: town.name,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};
