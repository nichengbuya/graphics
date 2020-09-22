import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

class OutLinePassCopy extends OutlinePass {
	changeVisibilityOfNonSelectedObjects(bVisible: any) {

		let selectedMeshes = [];

		function gatherSelectedMeshesCallBack(object) {

			if (object.isMesh) selectedMeshes.push(object);

		}

		for (let i = 0; i < this.selectedObjects.length; i++) {

			let selectedObject = this.selectedObjects[i];
			selectedObject.traverse(gatherSelectedMeshesCallBack);

		}

		function VisibilityChangeCallBack(object) {

			if (object.isMesh || object.isLine || object.isSprite || object.isTransformControls) {

				let bFound = false;

				for (let i = 0; i < selectedMeshes.length; i++) {

					let selectedObjectId = selectedMeshes[i].id;

					if (selectedObjectId === object.id) {

						bFound = true;
						break;

					}

				}

				if (!bFound) {

					let visibility = object.visible;

					if (!bVisible || object.bVisible) object.visible = bVisible;

					object.bVisible = visibility;

				}

			}

		}

		this.renderScene.traverse(VisibilityChangeCallBack);

	}
}
export default OutLinePassCopy;
