#pragma once

#include <Arduino.h>

bool chtaFetchElectrumBalance(const String& wallet, double& balance,
                             String& source, String& error);
