from collections import OrderedDict
import math


def get_random_rgb():
    """Generate a random RGB value

    Returns
    -------
        :obj:`list` of :obj:`float`: Random RGB array
    """
    return [round(math.random()*255) for _ in range(0, 3)]



def assign_random_colors(data_vector):
    """Produces a vector of random colors for each class of data

    Useful for exploratory data analysis

    Parameters
    ---------
    data_vector : list
        Vector of data classes to be categorized, passed from the data itself

    Returns
    -------
        collections.OrderedDict : Dictionary of random RGBA value per class, keyed on class
    """
    deduped_classes = list(set(data_vector))
    classes = sorted([str(x) for x in deduped_classes])
    colors = []
    for _ in classes:
        colors.append(get_random_rgb())
    return OrderedDict([item for item in zip(classes, colors)])
