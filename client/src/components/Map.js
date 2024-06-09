import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const Map= (props) => {
    const { isLoaded } = props;
    const containerStyle = {
        width: '400px',
        height: '400px'
    };
      
    const center = {
        lat: -3.745,
        lng: -38.523
    };
    return isLoaded && (
        <>
            <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            >
            { /* Child components, such as markers, info windows, etc. */ }
            <></>
            </GoogleMap>
        </>
        )
};

export default Map;
