import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BleManager } from "react-native-ble-plx";

const _BleManager = new BleManager();

export default function App() {
  const [displayText, setDisplayText] = useState<any>("");
  const [devices, setDevices] = useState<any[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [characteristics, setCharacteristics] = useState<any[]>([]);

  console.log(devices);

  const disconnectDevice = () => {
    if (connectedDevice) {
      connectedDevice.cancelConnection();
      setConnectedDevice(null);
      setDisplayText("");
    }
  };

  const startScan = () => {
    _BleManager.startDeviceScan(
      null,
      null,
      async (error, device: any) => {
        if (error) {
          console.error("Error scanning:", error);
          return;
        }
        console.log("Found device:", device.localName, device.name);
        if (device.localName === "Test" || device.name === "Test") {
          setDevices((prevDevices) => [...prevDevices, device]);
        }
      }
    );
  };

  const connectDevice = async (device: any) => {
    try {
      _BleManager.stopDeviceScan();
      const connectedDevice = await _BleManager.connectToDevice(
        device.id
      );
      await connectedDevice.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connectedDevice);
      setDisplayText(
        `Device connected\n with ${connectedDevice.name}`
      );
      setDevices([]);
      const services = await connectedDevice.services();
      for (const service of services) {
        const characteristics = await service.characteristics();
        setCharacteristics((prevCharacteristics) => [
          ...prevCharacteristics,
          ...characteristics,
        ]);
      }
    } catch (error) {
      console.error("Error connecting to device:", error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {devices.length === 0 && !connectedDevice ? (
        <View style={styles.centeredContainer}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={startScan}
            style={styles.circleView}
          >
            <Text style={styles.boldTextStyle}>
              {displayText || "Start Scanning"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={devices}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() => connectDevice(item)}
              style={styles.deviceListItem}
            >
              <Text style={styles.deviceListItemText}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {connectedDevice && (
        <View style={styles.centeredContainer}>
          <Text style={styles.centeredText}>
            Tap button to disconnect device.
          </Text>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={disconnectDevice}
            style={styles.circleView}
          >
            <Text style={styles.boldTextStyle}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: 10,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circleView: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  boldTextStyle: {
    fontSize: 20,
    color: "#000",
    fontWeight: "bold",
    textAlign: "center",
  },
  deviceListItem: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  deviceListItemText: {
    color: "black",
    fontSize: 18,
  },
  centeredText: {
    marginBottom: 12,
    textAlign: "center",
  },
});
