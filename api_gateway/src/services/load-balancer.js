function getNextInstance(service, excluded = []) {
  const healthyInstances = service.instances.filter((instance) => {
    return instance.healthy && !excluded.includes(instance.url);
  });

  if (healthyInstances.length === 0) {
    return null;
  }

  // Round Robin
  const index = service.current % healthyInstances.length;

  service.current++;

  return healthyInstances[index];
}

module.exports = getNextInstance;
