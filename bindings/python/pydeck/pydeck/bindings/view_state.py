from .json_tools import JSONMixin

class ViewState(JSONMixin):
    """An object that represents where the state of a viewport, essentially where the screen is focused.

    If you have two dimensional data and you don't want to set this manually, see `pydeck.data_utils.compute_viewport`.


    Parameters
    ---------
    longitude : float, default 0.0
        x-coordinate of focus
    latitude : float, default 0.0
        y-coordinate of focus
    zoom : float, default 1
        Magnification level of the map, usually between 0 (representing the whole world)
        and 24 (close to individual buildings)
    min_zoom : float, default 0
        Least mangified zoom level the user can navigate to
    max_zoom : float, default 20
        Most magnified zoom level the user can navigate to
    pitch : float, default 0
        Up/down angle relative to the map's plane, with 0 being looking directly at the map
    bearing : float, default 0
        Left/right angle relative to the map's true north, with 0 being aligned to true north
    """

    def __init__(
        self,
        longitude=0.0,
        latitude=0.0,
        zoom=1,
        min_zoom=0,
        max_zoom=20,
        pitch=0,
        bearing=0,
        **kwargs
    ):
        self.longitude = longitude
        self.latitude = latitude
        self.zoom = zoom
        self.min_zoom = min_zoom
        self.max_zoom = max_zoom
        self.pitch = pitch
        self.bearing = bearing

        if kwargs:
            self.__dict__.update(kwargs)
