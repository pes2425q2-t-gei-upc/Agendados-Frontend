// types/react-native-map-clustering-fh.d.ts
declare module 'react-native-map-clustering-fh' {
  import { Component } from 'react';
  import { ViewStyle, StyleProp } from 'react-native';
  import {
    MapViewProps,
    Region,
    LatLng,
    EdgePadding,
    Camera,
    MapBoundaries,
  } from 'react-native-maps';

  export interface ClusterData {
    id: string;
    coordinate: LatLng;
    pointCount: number;
    clusterId: number;
  }

  export interface MapViewClusteringProps
    extends Omit<MapViewProps, 'children'> {
    // Clustering specific props
    clusteringEnabled?: boolean;
    clusterColor?: string;
    clusterTextColor?: string;
    clusterFontFamily?: string;
    radius?: number;
    maxZoom?: number;
    minZoom?: number;
    extent?: number;
    nodeSize?: number;
    children?: React.ReactNode;

    // Event handlers
    onClusterPress?: (cluster: ClusterData, markers?: any[]) => void;
    preserveClusterPressBehavior?: boolean;

    // Animation
    layoutAnimationConf?: any;
    animationEnabled?: boolean;

    // Custom rendering
    renderCluster?: (cluster: ClusterData) => React.ReactElement;

    // Spider/spiral configuration
    spiderLineColor?: string;
    spiralEnabled?: boolean;

    // Padding
    edgePadding?: EdgePadding;

    // Style
    style?: StyleProp<ViewStyle>;

    // Loading
    loadingEnabled?: boolean;
    loadingIndicatorColor?: string;
    loadingBackgroundColor?: string;

    // Zoom controls
    zoomControlEnabled?: boolean;

    // Marker behavior
    moveOnMarkerPress?: boolean;
    removeClippedSubviews?: boolean;
  }

  export class MapView extends Component<MapViewClusteringProps> {
    // Animation methods
    animateToRegion(region: Region, duration?: number): void;
    animateToCoordinate(latLng: LatLng, duration?: number): void;

    // Fitting methods
    fitToElements(animated?: boolean): void;
    fitToSuppliedMarkers(markerIDs: string[], animated?: boolean): void;
    fitToCoordinates(
      coordinates: LatLng[],
      options?: {
        edgePadding?: EdgePadding;
        animated?: boolean;
      }
    ): void;

    // Camera methods
    getCamera(): Promise<Camera>;
    setCamera(camera: Camera): void;
    animateCamera(camera: Camera, duration?: number): void;

    // Boundary methods
    getMapBoundaries(): Promise<MapBoundaries>;

    // Clustering methods
    getClusteringEngine(): any;
    getClustersFor(region: Region): ClusterData[];
  }

  export default MapView;
}
