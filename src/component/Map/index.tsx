import React, { useState, useEffect  } from 'react';
import { GoogleMap, useLoadScript, Marker, MarkerClustererF } from '@react-google-maps/api';
import { db, collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from '../../firebase';


const containerStyle = {
  width: '100%',
  height: '600px',
};

const center = {
  lat: 48.3794, 
  lng: 31.1656,
};

const Map: React.FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDHAI4xfKkMMHDzF7VbxXEimGp8XelZkxE',
  });

  const [markers, setMarkers] = useState<{ id: string; lat: number; lng: number; label: string }[]>([]);

  useEffect(() => {
    const fetchMarkers = async () => {
      const snapshot = await getDocs(collection(db, 'quests'));
      const loadedMarkers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMarkers(loadedMarkers as any);
    };

    fetchMarkers();
  }, []);

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const newMarker = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        label: (markers.length + 1).toString(),
      };

      const docRef = await addDoc(collection(db, 'quests'), newMarker);
      setMarkers((current) => [...current, { ...newMarker, id: docRef.id }]);
    }
  };

  const handleMarkerDragEnd = async (event: google.maps.MapMouseEvent, index: number) => {
    if (event.latLng) {
      const updatedMarkers = [...markers];
      updatedMarkers[index] = {
        ...updatedMarkers[index],
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };

      await updateDoc(doc(db, 'quests', updatedMarkers[index].id), {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });

      setMarkers(updatedMarkers);
    }
  };

  const handleMarkerClick = async (indexToRemove: number) => {
    const markerToRemove = markers[indexToRemove];
    await deleteDoc(doc(db, 'quests', markerToRemove.id));

    const updatedMarkers = markers.filter((_, index) => index !== indexToRemove);
    const reindexedMarkers = updatedMarkers.map((marker, index) => ({
      ...marker,
      label: (index + 1).toString(),
    }));

    for (const marker of reindexedMarkers) {
      await updateDoc(doc(db, 'quests', marker.id), { label: marker.label });
    }

    setMarkers(reindexedMarkers);
  };

  const handleClearMarkers = async () => {
    for (const marker of markers) {
      await deleteDoc(doc(db, 'quests', marker.id));
    }
    setMarkers([]);
  };

  if (loadError) {
    return <div>Помилка завантаження карти</div>;
  }

  if (!isLoaded) {
    return <div>Завантаження карти...</div>;
  }

  return (
    <div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={8}
        onClick={handleMapClick}
      >
        <MarkerClustererF>
          {(clusterer) =>
            <>
              {markers.map((marker, index) => (
                <Marker
                  key={marker.id}
                  position={{ lat: marker.lat, lng: marker.lng }}
                  label={marker.label}
                  draggable={true}
                  clusterer={clusterer}
                  onDragEnd={(event) => handleMarkerDragEnd(event, index)}
                  onClick={() => handleMarkerClick(index)}
                />
              ))}
            </>
          }
        </MarkerClustererF>
      </GoogleMap>
      <button onClick={handleClearMarkers}>Видалити всі маркери</button>
    </div>
  );
};



export default Map;
