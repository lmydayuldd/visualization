package visualization.objects;

import org.apache.commons.math3.linear.RealMatrix;

import javafx.geometry.Point3D;

public class Car {

    private long id;
    private Point3D acceleration;
    private Point3D velocity;
    private Point3D position;
    private double steeringAngle;
    private RealMatrix rotation;

    public RealMatrix getRotation() {
        return rotation;
    }

    public void setRotation(RealMatrix rotation) {
        this.rotation = rotation;
    }

    public double getSteeringAngle() {
        return steeringAngle;
    }

    public void setSteeringAngle(double steeringAngle) {
        this.steeringAngle = steeringAngle;
    }

    public Point3D getVelocity() {
        return velocity;
    }

    public void setVelocity(Point3D velocity) {
        this.velocity = velocity;
    }

    public Point3D getAcceleration() {
        return acceleration;
    }

    public void setAcceleration(Point3D acceleration) {
        this.acceleration = acceleration;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Point3D getPosition() {
        return position;
    }

    public void setPosition(Point3D position) {
        this.position = position;
    }

}
