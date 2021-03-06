/**
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useState, FunctionComponent, useEffect, useCallback } from 'react';
import { SafeAreaView, StatusBar, Button, View, Text, ViewProps } from 'react-native';

import { EngineView, useEngine } from '@babylonjs/react-native';
import { Scene, Vector3, Mesh, ArcRotateCamera, Camera, PBRMetallicRoughnessMaterial, Color3, TargetCamera, WebXRSessionManager } from '@babylonjs/core';
import Slider from '@react-native-community/slider';

const EngineScreen: FunctionComponent<ViewProps> = (props: ViewProps) => {
  const defaultScale = 1;

  const engine = useEngine();
  const [toggleView, setToggleView] = useState(false);
  const [camera, setCamera] = useState<Camera>();
  const [box, setBox] = useState<Mesh>();
  const [scene, setScene] = useState<Scene>();
  const [xrSession, setXrSession] = useState<WebXRSessionManager>();
  const [scale, setScale] = useState<number>(defaultScale);

  useEffect(() => {
    if (engine) {
      const scene = new Scene(engine);
      setScene(scene);
      scene.createDefaultCamera(true);
      (scene.activeCamera as ArcRotateCamera).beta -= Math.PI / 8;
      setCamera(scene.activeCamera!);
      scene.createDefaultLight(true);

      const box = Mesh.CreateBox("box", 0.3, scene);
      setBox(box);
      const mat = new PBRMetallicRoughnessMaterial("mat", scene);
      mat.metallic = 1;
      mat.roughness = 0.5;
      mat.baseColor = Color3.Red();
      box.material = mat;

      scene.beforeRender = function () {
        box.rotate(Vector3.Up(), 0.005 * scene.getAnimationRatio());
      };
    }
  }, [engine]);

  useEffect(() => {
    if (box) {
      box.scaling = new Vector3(scale, scale, scale);
    }
  }, [box, scale]);

  const onToggleXr = useCallback(() => {
    (async () => {
      if (xrSession) {
        await xrSession.exitXRAsync();
        setXrSession(undefined);
      } else {
        if (box !== undefined && scene !== undefined) {
          const xr = await scene.createDefaultXRExperienceAsync({ disableDefaultUI: true, disableTeleportation: true })
          const session = await xr.baseExperience.enterXRAsync("immersive-ar", "unbounded", xr.renderTarget);
          setXrSession(session);
          // TODO: Figure out why getFrontPosition stopped working
          //box.position = (scene.activeCamera as TargetCamera).getFrontPosition(2);
          const cameraRay = scene.activeCamera!.getForwardRay(1);
          box.position = cameraRay.origin.add(cameraRay.direction.scale(cameraRay.length)); 
          box.rotate(Vector3.Up(), 3.14159);
        }
      }
    })();
  }, [box, scene, xrSession]);

  return (
    <>
      <View style={props.style}>
        <Button title="Toggle EngineView" onPress={() => { setToggleView(!toggleView) }} />
        <Button title={ xrSession ? "Stop XR" : "Start XR"} onPress={onToggleXr} />
        { !toggleView &&
          <View style={{flex: 1}}>
            <EngineView style={props.style} camera={camera} />
            <Slider style={{position: 'absolute', minHeight: 50, margin: 10, left: 0, right: 0, bottom: 0}} minimumValue={0.2} maximumValue={2} value={defaultScale} onValueChange={setScale} />
          </View>
        }
        { toggleView &&
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 24}}>EngineView has been removed.</Text>
            <Text style={{fontSize: 12}}>Render loop stopped, but engine is still alive.</Text>
          </View>
        }
      </View>
    </>
  );
};

const App = () => {
  const [toggleScreen, setToggleScreen] = useState(false);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{flex: 1}}>
        { !toggleScreen &&
          <EngineScreen style={{flex: 1}} />
        }
        { toggleScreen &&
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 24}}>EngineScreen has been removed.</Text>
            <Text style={{fontSize: 12}}>Engine has been disposed, and will be recreated.</Text>
          </View>
        }
        <Button title="Toggle EngineScreen" onPress={() => { setToggleScreen(!toggleScreen) }} />
      </SafeAreaView>
    </>
  );
};

export default App;
