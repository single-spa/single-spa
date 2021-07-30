const eventTarget = new EventTarget();

export function getEventTarget() {
  return eventTarget;
}
export async function bootstrap() {}
export async function mount() {
  eventTarget.dispatchEvent(new CustomEvent("mount-start"));
  await new Promise((r) => setTimeout(r, 100));
}
export async function unmount() {}
