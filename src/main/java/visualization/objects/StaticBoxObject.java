package visualization.objects;

import commons.simulation.PhysicalObject;
import commons.utils.Geometry;
import javafx.geometry.Point3D;
import org.apache.commons.math3.linear.RealMatrix;

/**
 * Class that represents a basic static object that is represented by a box, created with PhysicalObject interface
 * Copy values to class fields such that this object can be converted and sent to visualization
 */
public class StaticBoxObject {

    private long id;
    private Point3D position;
    private RealMatrix rotation;
    private double length;
    private double width;
    private double height;
    private int objectType;

    public StaticBoxObject(PhysicalObject physicalObject) {
        id = physicalObject.getId();
        position = Geometry.realVector2Point3D(physicalObject.getGeometryPos());
        rotation = physicalObject.getGeometryRot().copy();
        length = physicalObject.getLength();
        width = physicalObject.getWidth();
        height = physicalObject.getHeight();
        objectType = physicalObject.getPhysicalObjectType().ordinal();
    }

    public long getId() {
        return id;
    }

    public Point3D getPosition() {
        return position;
    }

    public RealMatrix getRotation() {
        return rotation;
    }

    public double getLength() {
        return length;
    }

    public double getWidth() {
        return width;
    }

    public double getHeight() {
        return height;
    }

    public int getObjectType() {
        return objectType;
    }
}
